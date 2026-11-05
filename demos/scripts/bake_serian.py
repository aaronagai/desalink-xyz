"""Bake the Terminal dashboard's map of Serian district from open data.

Inputs (downloaded into a working folder, passed as argv[1]):
  serian.json  - OpenStreetMap relation 15971404 (Serian District), out geom
  places.json  - OSM place=town|village|hamlet nodes inside the district
  lines.json   - OSM rivers and main roads (trunk..tertiary) around it, plus Serian town
  tiles/       - AWS Terrain Tiles (terrarium, z11) covering the view
Outputs:
  images/terminal-terrain.jpg  - dark hillshade of the view
  demos/src/terminal/geo.ts    - projected geometry for the dashboard

Map data (c) OpenStreetMap contributors, ODbL. Elevation: AWS Terrain Tiles
(SRTM and others, public domain / open). Village statuses and household
counts are illustrative, generated deterministically.
"""
import json, math, sys, zlib, os
import numpy as np
from PIL import Image
from shapely.geometry import LineString, Point, MultiPoint, Polygon, box
from shapely.ops import linemerge, polygonize, unary_union, voronoi_diagram

SRC = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

LON0, LON1, LAT0, LAT1 = 110.36, 111.04, 0.83, 1.40
W = 1000
def my(lat): return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
MY0, MY1 = my(LAT1), my(LAT0)
H = round(W * (MY0 - MY1) / math.radians(LON1 - LON0))
def proj(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * W, (MY0 - my(lat)) / (MY0 - MY1) * H)

load = lambda f: json.load(open(os.path.join(SRC, f)))

# District outline
rel = load('serian.json')['elements'][0]
outer = [LineString([proj(p['lon'], p['lat']) for p in m['geometry']]) for m in rel['members'] if m['type'] == 'way' and m.get('role') == 'outer']
district = max(polygonize(linemerge(outer)), key=lambda p: p.area).simplify(0.6)

# Places
places = load('places.json')['elements']
lines = load('lines.json')['elements']
serian = next(e for e in lines if e['type'] == 'node')
town = proj(serian['lon'], serian['lat'])

# Zones: Voronoi cells around eight real settlements, clipped to the district
ANCHORS = [
    ('serian', 'Serian', (serian['lon'], serian['lat'])),
    ('tarat', 'Tarat', (110.5337, 1.2057)),
    ('taee', 'Taee', (110.4686, 1.2065)),
    ('tebakang', 'Tebakang', (110.5114, 1.1040)),
    ('semuja', 'Semuja', (110.6229, 1.1254)),
    ('balai', 'Balai Ringin', (110.7565, 1.0501)),
    ('gawang', 'Gawang', (110.9140, 1.0765)),
    ('mentung', 'Mentung', (110.6059, 0.9879)),
]
pts = MultiPoint([proj(*a[2]) for a in ANCHORS])
cells = voronoi_diagram(pts, envelope=box(-200, -200, W + 200, H + 200))
zones = []
for zid, name, ll in ANCHORS:
    p = Point(proj(*ll))
    cell = next(c for c in cells.geoms if c.contains(p))
    z = cell.intersection(district)
    if z.geom_type == 'MultiPolygon':
        z = max(z.geoms, key=lambda g: g.area)
    zones.append((zid, name, z.simplify(0.5)))

def ring(poly):
    c = list(poly.exterior.coords)
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in c[:-1]) + 'Z'

# Villages with illustrative status and households
def h(s): return zlib.crc32(s.encode())
villages = []
seen = set()
for e in places:
    n = e['tags'].get('name')
    if not n or e['tags'].get('place') == 'town' or n in seen:
        continue
    seen.add(n)
    x, y = proj(e['lon'], e['lat'])
    zone = next((zid for zid, _, z in zones if z.contains(Point(x, y))), None)
    if not zone:
        continue
    k = h(n)
    status = 'none' if k % 100 < 17 else 'connected'
    villages.append({'id': f'v{len(villages)}', 'name': n.replace("'", '’'), 'x': round(x, 1), 'y': round(y, 1), 'zone': zone,
                     'homes': 28 + k % 130, 'status': status, 'mbps': 150 + (k >> 8) % 90 if status == 'connected' else None,
                     'km': round(0.3 + ((k >> 4) % 40) / 10, 1)})
# Keep the story's two villages in Tebakang without coverage
for v in villages:
    if v['name'] in ('Kampung Engkeroh Tebakang',):
        v['status'] = 'none'; v['mbps'] = None

# Rivers and roads, clipped to the view and simplified
view = box(0, 0, W, H)
def path(e, tol):
    g = LineString([proj(p['lon'], p['lat']) for p in e['geometry']]).intersection(view)
    if g.is_empty: return None
    g = g.simplify(tol)
    parts = getattr(g, 'geoms', [g])
    return ''.join('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in p.coords) for p in parts if p.geom_type == 'LineString' and len(p.coords) > 1)

rivers, major, minor = [], [], []
for e in lines:
    if e['type'] != 'way': continue
    t = e['tags']
    if t.get('waterway') == 'river':
        d = path(e, 0.8)
        if d: rivers.append((d, t.get('name') == 'Batang Sadong'))
    elif t.get('highway') in ('trunk', 'primary'):
        d = path(e, 0.8)
        if d: major.append(d)
    elif t.get('highway') in ('secondary', 'tertiary'):
        d = path(e, 1.0)
        if d: minor.append(d)

# Terrain: stitch terrarium tiles, hillshade, crop to the view
Z = 11
def tile_of(lon, lat):
    n = 2 ** Z
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
tx0, ty0 = tile_of(LON0, LAT1); tx1, ty1 = tile_of(LON1, LAT0)
X0, Y0, X1, Y1 = int(tx0), int(ty0), int(tx1), int(ty1)
mosaic = np.zeros(((Y1 - Y0 + 1) * 256, (X1 - X0 + 1) * 256), dtype=np.float32)
for x in range(X0, X1 + 1):
    for y in range(Y0, Y1 + 1):
        a = np.asarray(Image.open(os.path.join(SRC, 'tiles', f'{Z}-{x}-{y}.png')).convert('RGB')).astype(np.float32)
        mosaic[(y - Y0) * 256:(y - Y0 + 1) * 256, (x - X0) * 256:(x - X0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
px0, py0 = (tx0 - X0) * 256, (ty0 - Y0) * 256
px1, py1 = (tx1 - X0) * 256, (ty1 - Y0) * 256
elev = np.clip(mosaic[int(py0):int(py1), int(px0):int(px1)], 0, None)
# A light 5x5 smoothing takes the radar speckle off the flat lowlands
k = np.ones(5) / 5
elev = np.pad(elev, 2, mode='edge')
elev = np.apply_along_axis(lambda r: np.convolve(r, k, mode='valid'), 1, elev)
elev = np.apply_along_axis(lambda c: np.convolve(c, k, mode='valid'), 0, elev)
cell = 40075016 * math.cos(math.radians(1.1)) / (2 ** Z * 256)  # metres per pixel
gy, gx = np.gradient(elev, cell)
slope = np.arctan(3.2 * np.hypot(gx, gy))
aspect = np.arctan2(-gx, gy)
az, alt = math.radians(315), math.radians(42)
shade = np.clip(np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)
height = np.clip(elev / 900, 0, 1)
# Dark, cool relief: near-black lowlands, ridges catching a cold light
lum = 13 + shade ** 1.3 * 62 + height * 34
rgb = np.stack([lum * 0.92, lum * 0.96, lum * 1.06], -1)
img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize((W * 2, H * 2), Image.LANCZOS)
img.save(os.path.join(ROOT, 'images', 'terminal-terrain.jpg'), quality=74, optimize=True, progressive=True)

# Write geo.ts
out = ['// Generated by demos/scripts/bake_serian.py. Do not edit by hand.',
       '// Map data (c) OpenStreetMap contributors (ODbL). Elevation: AWS Terrain Tiles.',
       '// Zones are Desalink service zones around real settlements, not official boundaries.',
       '// Village statuses and household counts are illustrative.',
       f'export const VIEW = {{ w: {W}, h: {H} }}',
       f"export const DISTRICT = '{ring(district)}'",
       f'export const TOWN = {{ x: {town[0]:.1f}, y: {town[1]:.1f}, name: \'Serian\' }}',
       'export const ZONES = ' + json.dumps([{'id': zid, 'name': name, 'path': ring(z), 'cx': round(z.representative_point().x, 1), 'cy': round(z.representative_point().y, 1),
                                              'box': [round(v, 1) for v in z.bounds]} for zid, name, z in zones]),
       'export const RIVERS = ' + json.dumps([{'d': d, 'main': m} for d, m in rivers]),
       'export const ROADS_MAJOR = ' + json.dumps(major),
       'export const ROADS_MINOR = ' + json.dumps(minor),
       'export const VILLAGES = ' + json.dumps(villages),
       '']
open(os.path.join(ROOT, 'demos', 'src', 'terminal', 'geo.ts'), 'w').write('\n'.join(out))
print('view', W, H, 'zones', [(z[0], round(z[2].area)) for z in zones], 'villages', len(villages), 'rivers', len(rivers), 'roads', len(major), len(minor))
print('none', sum(v['status'] == 'none' for v in villages))

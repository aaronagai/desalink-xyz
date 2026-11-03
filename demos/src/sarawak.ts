// The dotted Sarawak map from script.js (SiteMap), ported so the Terminal
// demo draws the same land and the same site positions as the live demo.

export const VB_W = 630
export const VB_H = 430
const LON0 = 109.5, LAT0 = 5.15, K = 100

const OUTLINE: [number, number][] = [
  [109.64, 2.08], [109.78, 1.82], [109.9, 1.72], [110.2, 1.74], [110.35, 1.72],
  [110.6, 1.72], [110.9, 1.62], [111.12, 1.6], [111.35, 1.78], [111.55, 2.0],
  [111.8, 2.25], [111.95, 2.55], [112.1, 2.9], [112.5, 3.0], [113.0, 3.18],
  [113.35, 3.55], [113.7, 3.95], [114.0, 4.4], [114.1, 4.6], [114.3, 4.45],
  [114.55, 4.28], [114.8, 4.45], [114.95, 4.8], [115.05, 4.95], [115.2, 4.6],
  [115.35, 4.9], [115.55, 5.02], [115.62, 4.8], [115.5, 4.45], [115.62, 4.15],
  [115.6, 3.8], [115.45, 3.35], [115.15, 2.85], [114.85, 2.25], [114.55, 1.8],
  [114.2, 1.45], [113.7, 1.25], [113.1, 1.3], [112.5, 1.5], [112.15, 1.15],
  [111.9, 0.95], [111.3, 0.98], [110.8, 0.88], [110.4, 0.98], [110.05, 1.3],
  [109.7, 1.55], [109.58, 1.85],
]

const COORDS: Record<string, [number, number]> = {
  'bukit semuja': [110.57, 1.13], padawan: [110.3, 1.32], bau: [110.15, 1.42],
  lundu: [109.86, 1.66], sematan: [109.8, 1.79], 'lubok antu': [111.83, 1.1],
  betong: [111.53, 1.41], spaoh: [111.45, 1.28], asajaya: [110.6, 1.56],
  'kota samarahan': [110.49, 1.45], simunjan: [110.76, 1.38], kanowit: [112.15, 2.1],
  selangau: [112.25, 2.42], dalat: [111.95, 2.73], julau: [111.92, 2.02],
  meradong: [111.62, 2.15], kapit: [112.93, 2.01], belaga: [113.78, 2.7],
  song: [112.55, 2.0], marudi: [114.3, 4.18], niah: [113.72, 3.87],
  subis: [113.85, 3.75], tatau: [112.86, 2.88], sebauh: [113.28, 3.08],
  limbang: [114.98, 4.7], lawas: [115.4, 4.82],
}

export type Status = 'connected' | 'pending' | 'inactive'

// Same sites, order and statuses as SITES in script.js (only what the map needs)
const SITES: [string, string, Status][] = [
  ['Kampung Riih Daso', 'bukit semuja', 'connected'], ['Kampung Rasau', 'bukit semuja', 'connected'],
  ['Kampung Merakai', 'bukit semuja', 'connected'], ['Kampung Tebakang', 'bukit semuja', 'pending'],
  ['Kampung Sungai Buloh', 'bukit semuja', 'pending'], ['Kampung Sadir', 'padawan', 'connected'],
  ['Rumah Panjang Bratak', 'bau', 'connected'], ['Kampung Stungkor', 'lundu', 'connected'],
  ['Kampung Pueh', 'sematan', 'pending'], ['Rumah Panjang Nanga Merit', 'lubok antu', 'connected'],
  ['Kampung Paku', 'betong', 'connected'], ['Long Banyok', 'spaoh', 'pending'],
  ['Kampung Aceh', 'asajaya', 'connected'], ['Kampung Siburan', 'kota samarahan', 'connected'],
  ['Rumah Panjang Rimbas', 'simunjan', 'pending'], ['Long Busai', 'kanowit', 'connected'],
  ['Kampung Ngemah', 'selangau', 'connected'], ['Kampung Oya', 'dalat', 'inactive'],
  ['Rumah Panjang Nanga Julau', 'julau', 'connected'], ['Kampung Balingian', 'meradong', 'pending'],
  ['Long Busang', 'kapit', 'connected'], ['Long Bedian', 'belaga', 'connected'],
  ['Kampung Nanga Mujong', 'song', 'inactive'], ['Long Lama', 'marudi', 'connected'],
  ['Kampung Niah', 'niah', 'connected'], ['Rumah Panjang Batu Niah', 'subis', 'pending'],
  ['Long Tatau', 'tatau', 'connected'], ['Kampung Sebauh Hilir', 'sebauh', 'pending'],
  ['Kampung Medamit', 'limbang', 'connected'], ['Long Semadoh', 'lawas', 'pending'],
]

const project = ([lon, lat]: [number, number]): [number, number] => [(lon - LON0) * K, (LAT0 - lat) * K]
const poly = OUTLINE.map(project)

function inside(x: number, y: number) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!, [xj, yj] = poly[j]!
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/** Land dots on a 9-unit grid, in viewBox units. */
export const LAND: [number, number][] = []
for (let y = 4.5; y < VB_H; y += 9) for (let x = 4.5; x < VB_W; x += 9) if (inside(x, y)) LAND.push([x, y])

/** One dot per site; sites sharing a location fan out as in script.js. */
export const SITE_DOTS = (() => {
  const seen: Record<string, number> = {}
  return SITES.map(([name, loc, status]) => {
    const n = (seen[loc] = (seen[loc] ?? 0) + 1) - 1
    const [x, y] = project(COORDS[loc]!)
    const a = n * 2.4
    return { name, status, x: x + (n ? Math.cos(a) * 11 * Math.sqrt(n) : 0), y: y + (n ? Math.sin(a) * 11 * Math.sqrt(n) : 0) }
  })
})()

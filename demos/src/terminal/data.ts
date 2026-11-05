// Serian district for the Terminal dashboard: illustrative zones (mukims)
// and villages, not survey boundaries or real household counts.

export type Status = 'connected' | 'none' | 'scheduled'
export type Village = { id: string; name: string; homes: number; status: Status; x: number; y: number; zone: string; mbps?: number; km: number }
export type Zone = { id: string; name: string; pts: [number, number][]; cx: number; cy: number; box: [number, number, number, number] }

const RAW: { id: string; name: string; pts: [number, number][]; villages: [string, number, Status][] }[] = [
  { id: 'tebedu', name: 'Mukim Tebedu', pts: [[180, 40], [420, 18], [492, 160], [340, 232], [210, 178]],
    villages: [['Kampung Tebedu', 132, 'connected'], ['Kampung Bunan Gega', 76, 'connected'], ['Kampung Tepoi', 48, 'none'], ['Kampung Sorak', 90, 'connected']] },
  { id: 'tebakang', name: 'Mukim Tebakang', pts: [[340, 232], [492, 160], [626, 212], [646, 362], [484, 420], [384, 360]],
    villages: [['Kampung Tebakang', 120, 'none'], ['Kampung Sungai Buloh', 64, 'none'], ['Kampung Plaman Baru', 70, 'connected'], ['Kampung Lebor', 58, 'connected']] },
  { id: 'mongkos', name: 'Mukim Mongkos', pts: [[484, 420], [646, 362], [766, 424], [742, 584], [562, 604]],
    villages: [['Kampung Mongkos', 92, 'none'], ['Kampung Pasir Hilir', 66, 'connected'], ['Kampung Retoh', 54, 'connected'], ['Kampung Bajong', 80, 'connected']] },
  { id: 'taee', name: 'Mukim Taee', pts: [[210, 178], [340, 232], [384, 360], [262, 430], [152, 330]],
    villages: [['Kampung Taee', 104, 'connected'], ['Kampung Bayor', 62, 'connected'], ['Kampung Payau', 44, 'connected']] },
  { id: 'riih', name: 'Mukim Riih', pts: [[152, 330], [262, 430], [242, 582], [110, 604], [76, 452]],
    villages: [['Kampung Riih Daso', 118, 'connected'], ['Kampung Rasau', 72, 'connected'], ['Kampung Merakai', 86, 'connected'], ['Kampung Kakai', 40, 'none']] },
  { id: 'pichin', name: 'Mukim Pichin', pts: [[262, 430], [384, 360], [484, 420], [562, 604], [384, 646], [242, 582]],
    villages: [['Kampung Pichin', 126, 'connected'], ['Kampung Tanah Mawang', 74, 'connected'], ['Kampung Lanchang', 58, 'connected'], ['Kampung Abang', 46, 'none']] },
  { id: 'kedup', name: 'Mukim Kedup', pts: [[626, 212], [784, 168], [864, 302], [766, 424], [646, 362]],
    villages: [['Kampung Kedup', 98, 'connected'], ['Kampung Bantang', 60, 'connected'], ['Kampung Krait', 52, 'connected']] },
]

// Village positions: fixed offsets around each zone's centre
const OFFSETS: [number, number][] = [[-8, -6], [46, -34], [-50, 30], [40, 38], [-46, -40]]

export const ZONES: Zone[] = []
export const VILLAGES: Village[] = []

for (const z of RAW) {
  const xs = z.pts.map((p) => p[0]), ys = z.pts.map((p) => p[1])
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length
  const cy = ys.reduce((a, b) => a + b, 0) / ys.length
  ZONES.push({ id: z.id, name: z.name, pts: z.pts, cx, cy, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] })
  z.villages.forEach(([name, homes, status], i) => {
    const [dx, dy] = OFFSETS[i]!
    const seed = (name.length * 37 + i * 11) % 60
    VILLAGES.push({
      id: `${z.id}-${i}`, name, homes, status, zone: z.id,
      x: cx + dx, y: cy + dy,
      mbps: status === 'connected' ? 160 + seed : undefined,
      km: Math.round((0.4 + (seed % 17) / 5) * 10) / 10,
    })
  })
}

export const ROADS = [
  'M10 690 C 140 600, 250 520, 380 470 S 600 380, 1000 330',
  'M300 0 C 320 120, 380 220, 440 300 S 540 520, 580 700',
  'M80 300 C 180 330, 260 300, 340 260',
]
export const LAND: [number, number][] = [[-600, -500], [1600, -500], [1600, 1200], [-600, 1200]]
export const TOWN = { x: 382, y: 448, name: 'Serian' }

export const pathOf = (pts: [number, number][]) => `M${pts.map((p) => p.join(' ')).join('L')}Z`

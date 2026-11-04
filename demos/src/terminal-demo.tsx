import { Stage } from './kit/stage'
import { Count } from './kit/motion/Count'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { Tablet } from './tablet'
import { langOf } from './lang'
import './terminal-demo.css'

// A bird's-eye view of one area, for the YB who looks after it: the Desalink
// Terminal on an iPad in portrait, showing Serian's villages on a simple area
// map (dotted district, river, main road, the town). Connected villages are
// solid; the three still without coverage are hollow and named, and listed in
// a sheet below with their households. The pointer picks Kampung Tebakang and
// Kampung Sungai Buloh, the button counts them, and one tap requests the
// rollout: both turn Scheduled on the map and in the list, with technicians
// due on site within 24 to 48 hours.

type S = { picked: number[]; requested: boolean }
const initial: S = { picked: [], requested: false }
const poster: S = { picked: [0, 1], requested: true }

const COPY = {
  en: {
    area: 'Serian',
    of: 'of 9 villages connected',
    sheet: 'Not yet connected',
    select: 'Select villages',
    request: (n: number) => `Request ${n} ${n === 1 ? 'village' : 'villages'}`,
    requested: 'Requested',
    homes: 'homes',
    scheduled: 'Scheduled',
    nScheduled: (n: number) => `${n} scheduled, on site in 24–48h`,
    date: 'Wed 4 Nov',
    town: 'Serian',
  },
  ms: {
    area: 'Serian',
    of: 'daripada 9 kampung bersambung',
    sheet: 'Belum bersambung',
    select: 'Pilih kampung',
    request: (n: number) => `Mohon ${n} kampung`,
    requested: 'Dimohon',
    homes: 'rumah',
    scheduled: 'Dijadualkan',
    nScheduled: (n: number) => `${n} dijadualkan, tiba dalam 24–48 jam`,
    date: 'Rab 4 Nov',
    town: 'Serian',
  },
}
const T = COPY[langOf(document.getElementById('terminalDemo'))]

// The area map, drawn in a 620 × 300 box and shown at 0.9. Shapes are illustrative.
const K = 0.9
const DISTRICT = [[34, 58], [128, 22], [262, 34], [388, 14], [520, 44], [600, 112], [590, 222], [500, 284], [362, 294], [222, 280], [92, 250], [24, 168]]
const RIVER = 'M0 128 C 110 150, 190 92, 300 132 S 470 206, 620 176'
const ROAD = 'M56 280 C 160 228, 240 206, 330 164 S 500 92, 620 70'
const TOWN = { x: 330, y: 164 }
const CONNECTED: [number, number][] = [[156, 214], [236, 246], [424, 218], [474, 120], [548, 186], [552, 252]]
// The three without coverage: name, households, pin, which side the label sits
const UNCOVERED = [
  { name: 'Kampung Tebakang', homes: 120, x: 118, y: 112, side: 'right' },
  { name: 'Kampung Sungai Buloh', homes: 64, x: 262, y: 70, side: 'right' },
  { name: 'Kampung Mongkos', homes: 92, x: 372, y: 250, side: 'right' },
] as const

// Dots filling the district, on a 12pt grid
const inside = (x: number, y: number) => {
  let hit = false
  for (let i = 0, j = DISTRICT.length - 1; i < DISTRICT.length; j = i++) {
    const [xi, yi] = DISTRICT[i]!, [xj, yj] = DISTRICT[j]!
    if ((yi! > y) !== (yj! > y) && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) hit = !hit
  }
  return hit
}
const LAND: [number, number][] = []
for (let y = 6; y < 300; y += 12) for (let x = 6; x < 620; x += 12) if (inside(x, y)) LAND.push([x, y])

async function script(a: Act<S>) {
  await a.wait(1300)
  await a.click({ at: 'row-0', x: 0.55, y: 0.5 })
  await a.set({ picked: [0] })
  await a.wait(650)
  await a.click({ at: 'row-1', x: 0.6, y: 0.5 })
  await a.set({ picked: [0, 1] })
  await a.wait(800)
  await a.click({ at: 'request', x: 0.1, y: 0.62 })
  await a.set({ requested: true })
  await a.wait(3400)
}

export function TerminalDemo() {
  return (
    <Stage<S>
      width={496}
      height={496}
      compact={{ below: 460, width: 342, height: 420 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 420, y: 250 }, compact: { x: 300, y: 220 } }, style: 'circle' }}
      className="td"
    >
      {(s, _rect, layout) => {
        const n = s.picked.length
        const state = (i: number) => (s.picked.includes(i) ? (s.requested ? 'scheduled' : 'picked') : 'open')
        return (
          <Tablet portrait date={T.date} width={layout === 'compact' ? 700 : 640} className="td-ipad">
            <div className="td-app">
              <div className="td-head">
                <div className="td-title">{T.area}</div>
                <div className="td-sub">
                  <Count value={6} />
                  <span>{T.of}</span>
                  <span className="td-sched" data-show={s.requested || undefined}>{T.nScheduled(2)}</span>
                </div>
              </div>

              <div className="td-map">
                <div className="td-map__in">
                <svg viewBox="0 0 620 300" width={558} height={270} aria-hidden>
                  <g className="td-land">
                    {LAND.map(([x, y]) => (
                      <circle key={`${x},${y}`} cx={x} cy={y} r={2.2} />
                    ))}
                  </g>
                  <path className="td-river" d={RIVER} />
                  <path className="td-road td-road--edge" d={ROAD} />
                  <path className="td-road" d={ROAD} />
                  {CONNECTED.map(([x, y]) => (
                    <circle key={`${x},${y}`} className="td-pin" data-state="connected" cx={x} cy={y} r={7} />
                  ))}
                </svg>
                <span className="td-town" style={{ left: TOWN.x * K, top: TOWN.y * K }}>
                  <i aria-hidden />
                  {T.town}
                </span>
                {UNCOVERED.map((v, i) => (
                  <span key={v.name} className="td-village" data-i={i} data-state={state(i)} data-side={v.side} style={{ left: v.x * K, top: v.y * K }}>
                    <i className="td-village__pin" aria-hidden />
                    <span className="td-village__name">{v.name}</span>
                  </span>
                ))}
                </div>
              </div>

              <div className="td-sheet">
                <div className="td-sheet__head">
                  <span className="td-sheet__title">{T.sheet}</span>
                  <span className="td-btn" data-target="request" data-ready={(n > 0 && !s.requested) || undefined} data-done={s.requested || undefined}>
                    <Roll variant="fade">{s.requested ? T.requested : n ? T.request(n) : T.select}</Roll>
                  </span>
                </div>
                <div className="td-rows">
                  {UNCOVERED.map((v, i) => (
                    <div key={v.name} className="td-row" data-target={`row-${i}`} data-state={state(i)}>
                      <span className="td-box" data-on={s.picked.includes(i) || undefined} aria-hidden>
                        <svg viewBox="0 0 16 16" width="14" height="14">
                          <path d="M3.5 8.4 6.6 11.4 12.5 5" />
                        </svg>
                      </span>
                      <span className="td-row__name">{v.name}</span>
                      <span className="td-row__meta">
                        <Roll variant="fade">{state(i) === 'scheduled' ? T.scheduled : `${v.homes} ${T.homes}`}</Roll>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tablet>
        )
      }}
    </Stage>
  )
}

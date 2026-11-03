import { useRef } from 'react'
import { CloudRain } from 'lucide-react'
import { Stage } from './kit/stage'
import { Phone } from './kit/phone'
import { Chart, chartPoints } from './kit/chart'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { langOf } from './lang'
import './storm-demo.css'

// Reliable & resilient, on a phone like Deployed fast: the Desalink Terminal's
// view of one site, Long Lama, for the day. A finger scrubs along the line and
// the headline reads out the hour under it. Through the afternoon's heavy rain
// the speed dips, the status never leaves Online, and the day's uptime stays
// at 100%: the rain slows it briefly, it doesn't take the site down.

type S = { hour: number | null; x: number | null }

// Hourly, 6 AM to 6 PM; heavy rain from 2 to 4 PM
const MBPS = [184, 190, 195, 191, 194, 197, 193, 190, 141, 118, 152, 188, 191]
const RAIN = [8, 10]

const COPY = {
  en: {
    hours: ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
    now: 'Now',
    online: 'Online',
    rain: 'Heavy rain',
    uptime: 'Uptime today',
    drops: 'Dropouts',
    axis: ['6 AM', '12 PM', '6 PM'],
  },
  ms: {
    hours: ['6 PG', '7 PG', '8 PG', '9 PG', '10 PG', '11 PG', '12 TGH', '1 PTG', '2 PTG', '3 PTG', '4 PTG', '5 PTG', '6 PTG'],
    now: 'Kini',
    online: 'Dalam talian',
    rain: 'Hujan lebat',
    uptime: 'Masa operasi hari ini',
    drops: 'Gangguan',
    axis: ['6 PG', '12 TGH', '6 PTG'],
  },
}
const T = COPY[langOf(document.getElementById('stormDemo'))]

// The chart in the phone's own points (screen 402pt, 20pt side insets)
const CW = 362
const CH = 150

async function script(a: Act<S>) {
  await a.wait(1000)
  const box = a.rect('plot')
  const k = box.width / CW // stage px per phone point
  const pts = chartPoints({ data: MBPS, width: CW, height: CH, dot: false })
  const at = (i: number) => ({ x: box.x + pts[i]!.x * k, y: box.y + (pts[i]!.y + 26) * k })
  const read = (pt: { x: number }) => {
    const x = Math.max(0, Math.min(CW, (pt.x - box.x) / k))
    let near = 0
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i]!.x - x) < Math.abs(pts[near]!.x - x)) near = i
    a.put({ hour: near, x })
  }
  // One press: along the morning into the rain, a rest there, then out the
  // other side. The finger lifts at the end and the headline returns to now.
  await a.move(at(3), { duration: 600 })
  const A = at(3), B = at(9), C = at(12)
  const lerp = (p: { x: number; y: number }, q: { x: number; y: number }, t: number) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
  const smooth = (t: number) => t * t * (3 - 2 * t)
  await a.drag(C, read, {
    duration: 5200,
    path: (e) => (e < 0.42 ? lerp(A, B, smooth(e / 0.42)) : e < 0.72 ? B : lerp(B, C, smooth((e - 0.72) / 0.28))),
  })
  // The hairline and dot fade where the finger left them
  a.put({ hour: null })
  await a.wait(1800)
}

// The y of the drawn line at x: a short search along the path's length
function yOn(path: SVGPathElement | null | undefined, x: number) {
  if (!path) return null
  let lo = 0
  let hi = path.getTotalLength()
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (path.getPointAtLength(mid).x < x) lo = mid
    else hi = mid
  }
  return path.getPointAtLength(hi).y
}

export function StormDemo() {
  const plot = useRef<HTMLDivElement>(null)
  return (
    <Stage<S>
      width={496}
      height={496}
      compact={{ below: 460, width: 342, height: 400 }}
      initial={{ hour: null, x: null }}
      poster={{ hour: 9, x: null }}
      script={script}
      cursor={{ at: { wide: { x: 250, y: 470 }, compact: { x: 170, y: 380 } }, style: 'touch' }}
      className="sd"
    >
      {(s, _rect, layout) => {
        const pts = chartPoints({ data: MBPS, width: CW, height: CH, dot: false })
        const hx = s.x ?? (s.hour === null ? null : pts[s.hour]!.x)
        const on = s.hour !== null
        const hy = hx === null ? null : (yOn(plot.current?.querySelector<SVGPathElement>('.ss-chart__line'), hx) ?? pts[s.hour ?? 0]!.y)
        const p = hx === null || hy === null ? null : { x: hx, y: hy }
        const step = pts[1]!.x - pts[0]!.x
        const band = { left: pts[RAIN[0]!]!.x - step / 2, right: pts[RAIN[1]!]!.x + step / 2 }
        return (
          <Phone width={layout === 'compact' ? 310 : 448} className="sd-phone">
            <div className="sd-screen">
              <div className="sd-head">
                <div className="sd-read">
                  <div className="sd-label">
                    Long Lama · <Roll variant="fade">{s.hour === null ? T.now : T.hours[s.hour]!}</Roll>
                  </div>
                  <div className="sd-value">
                    <Roll stagger={25}>{String(s.hour === null ? MBPS[MBPS.length - 1] : MBPS[s.hour])}</Roll>
                    <span className="sd-unit">Mbps</span>
                  </div>
                </div>
                <span className="sd-status">
                  <i aria-hidden />
                  {T.online}
                </span>
              </div>
              <div ref={plot} className="sd-plot" data-target="plot" style={{ width: CW, height: CH }}>
                <span className="sd-band" style={{ left: band.left, width: band.right - band.left }}>
                  <span className="sd-band__label">
                    <CloudRain size={15} strokeWidth={2} aria-hidden />
                    {T.rain}
                  </span>
                </span>
                <Chart data={MBPS} width={CW} height={CH} dot={false} max={220} />
                <span className="sd-hair" data-on={p && on ? '' : undefined} style={p ? { left: p.x } : undefined} />
                <span className="sd-dot" data-on={p && on ? '' : undefined} style={p ? { left: p.x, top: p.y } : undefined} />
              </div>
              <div className="sd-axis" style={{ width: CW }}>
                {T.axis.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="sd-stats">
                <div>
                  <span className="sd-stat__label">{T.uptime}</span>
                  <span className="sd-stat__value">100%</span>
                </div>
                <div>
                  <span className="sd-stat__label">{T.drops}</span>
                  <span className="sd-stat__value">0</span>
                </div>
              </div>
            </div>
          </Phone>
        )
      }}
    </Stage>
  )
}

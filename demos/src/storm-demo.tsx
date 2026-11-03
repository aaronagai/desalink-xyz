import { useRef } from 'react'
import { CloudRain } from 'lucide-react'
import { Stage } from './kit/stage'
import { Window } from './kit/window'
import { Chart, chartPoints } from './kit/chart'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { langOf, pageTheme } from './lang'
import './storm-demo.css'

// Reliable & resilient: one site's throughput for the day in the Desalink
// Terminal. A pointer scrubs along the line and the headline reads out the
// hour under it. Through the afternoon's heavy rain the speed dips, the
// status never leaves Online, and the day's uptime stays at 100%: the rain
// slows it briefly, it doesn't take the site down (as the FAQ says).

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

const W = { wide: 400, compact: 278 }
const H = 140

async function script(a: Act<S>) {
  await a.wait(900)
  const box = a.rect('plot')
  const pts = chartPoints({ data: MBPS, width: box.width, height: H, dot: false })
  const at = (i: number) => ({ x: box.x + pts[i]!.x, y: box.y + pts[i]!.y + 22 })
  const scrub = (to: number, duration: number) =>
    a.move(at(to), {
      duration,
      path: (e, from, end) => ({ x: from.x + (end.x - from.x) * e, y: from.y + (end.y - from.y) * e }),
      onMove: (pt) => {
        const x = Math.max(0, Math.min(box.width, pt.x - box.x))
        let near = 0
        for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i]!.x - x) < Math.abs(pts[near]!.x - x)) near = i
        a.put({ hour: near, x })
      },
    })
  // Onto the morning, then along the day into the rain
  await a.move(at(3), { duration: 700 })
  a.put({ hour: 3, x: pts[3]!.x })
  await a.wait(600)
  await scrub(9, 1500)
  // In the rain: slower, still online
  await a.wait(1800)
  // Out the other side: back to full speed
  await scrub(12, 1000)
  await a.wait(1300)
  // Off the chart: the headline returns to now
  let gone = false
  await a.move({ x: box.x + box.width + 30, y: box.y + box.height + 70 }, {
    duration: 600,
    onMove: (pt) => {
      if (!gone && (pt.x > box.x + box.width || pt.y > box.y + box.height)) {
        gone = true
        a.put({ hour: null })
      }
    },
  })
  await a.wait(1400)
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
  const theme = pageTheme()
  return (
    <Stage<S>
      width={496}
      height={404}
      compact={{ below: 460, width: 342, height: 392 }}
      initial={{ hour: null, x: null }}
      poster={{ hour: 9, x: null }}
      script={script}
      theme={theme}
      accent={theme === 'dark' ? '#f2f1ed' : '#141414'}
      cursor={{ at: { wide: { x: 440, y: 380 }, compact: { x: 300, y: 370 } } }}
      className="sd"
    >
      {(s, _rect, layout) => {
        const w = layout === 'compact' ? W.compact : W.wide
        const pts = chartPoints({ data: MBPS, width: w, height: H, dot: false })
        const hx = s.x ?? (s.hour === null ? null : pts[s.hour]!.x)
        const on = s.hour !== null
        const hy = hx === null ? null : (yOn(plot.current?.querySelector<SVGPathElement>('.ss-chart__line'), hx) ?? pts[s.hour ?? 0]!.y)
        const p = hx === null || hy === null ? null : { x: hx, y: hy }
        const step = pts[1]!.x - pts[0]!.x
        const band = { left: pts[RAIN[0]!]!.x - step / 2, right: pts[RAIN[1]!]!.x + step / 2 }
        return (
          <Window title="Long Lama" className="sd-win">
            <div className="sd-body">
              <div className="sd-head">
                <div className="sd-read">
                  <div className="sd-label">
                    <Roll variant="fade">{s.hour === null ? T.now : T.hours[s.hour]!}</Roll>
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
              <div ref={plot} className="sd-plot" data-target="plot" data-cursor="crosshair" style={{ width: w, height: H }}>
                <span className="sd-band" style={{ left: band.left, width: band.right - band.left }}>
                  <span className="sd-band__label">
                    <CloudRain size={14} strokeWidth={2} aria-hidden />
                    {T.rain}
                  </span>
                </span>
                <Chart data={MBPS} width={w} height={H} dot={false} max={220} />
                <span className="sd-hair" data-on={p && on ? '' : undefined} style={p ? { left: p.x } : undefined} />
                <span className="sd-dot" data-on={p && on ? '' : undefined} style={p ? { left: p.x, top: p.y } : undefined} />
              </div>
              <div className="sd-axis" style={{ width: w }}>
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
          </Window>
        )
      }}
    </Stage>
  )
}

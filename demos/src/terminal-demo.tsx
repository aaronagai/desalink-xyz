import { Stage } from './kit/stage'
import { Phone } from './kit/phone'
import { Check } from './kit/parts/Check'
import { Count } from './kit/motion/Count'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { LAND, SITE_DOTS, VB_H, VB_W } from './sarawak'
import { langOf } from './lang'
import './terminal-demo.css'

// A bird's-eye view, on a phone like Deployed fast: the Desalink Terminal's
// mobile view, the dotted map of every site in Sarawak (the same geometry and
// sites as the live demo) over a sheet of today's installs. The install at
// Rumah Panjang Rimbas finishes: its row ticks to Online, its dot on the map
// lights up and is named, and the connected count rolls from 19 to 20.

type S = { done: boolean }
const initial: S = { done: false }
const poster: S = { done: true }

const FOCUS = 'Rumah Panjang Rimbas'
const focus = SITE_DOTS.find((d) => d.name === FOCUS)!
const CONNECTED = SITE_DOTS.filter((d) => d.status === 'connected').length

const COPY = {
  en: {
    connected: 'connected',
    sites: '30 sites',
    today: 'Installing today',
    installing: 'Installing',
    online: 'Online',
    tomorrow: 'Tomorrow',
  },
  ms: {
    connected: 'bersambung',
    sites: '30 tapak',
    today: 'Pemasangan hari ini',
    installing: 'Dipasang',
    online: 'Dalam talian',
    tomorrow: 'Esok',
  },
}
const T = COPY[langOf(document.getElementById('terminalDemo'))]

async function script(a: Act<S>) {
  await a.wait(1800)
  await a.set({ done: true })
  await a.wait(3400)
}

// The map spans the screen's 402pt width, edge to edge
const MW = 402
const K = MW / VB_W

export function TerminalDemo() {
  return (
    <Stage<S>
      width={496}
      height={496}
      compact={{ below: 460, width: 342, height: 380 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      className="td"
    >
      {(s, _rect, layout) => (
        <Phone width={layout === 'compact' ? 310 : 448} className="td-phone">
          <div className="td-screen">
            <div className="td-map" style={{ height: VB_H * K }}>
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={MW} height={VB_H * K} aria-hidden>
                <g className="td-land">
                  {LAND.map(([x, y]) => (
                    <circle key={`${x},${y}`} cx={x} cy={y} r={2.2} />
                  ))}
                </g>
                {SITE_DOTS.map((d) => {
                  const status = d.name === FOCUS && s.done ? 'connected' : d.status
                  return <circle key={d.name} className="td-site" data-status={status} data-focus={d.name === FOCUS || undefined} cx={d.x} cy={d.y} r={6} />
                })}
              </svg>
              <span className="td-tag" data-show={s.done || undefined} style={{ left: focus.x * K, top: focus.y * K }}>
                {FOCUS}
              </span>
            </div>
            <div className="td-sheet">
              <div className="td-sheet__head">
                <span className="td-count">
                  <Count value={CONNECTED + (s.done ? 1 : 0)} />
                  <span>{T.connected}</span>
                </span>
                <span className="td-sites">{T.sites}</span>
              </div>
              <div className="td-sheet__title">{T.today}</div>
              <div className="td-row">
                <Check on={s.done} pending size={22} />
                <span className="td-row__name">{FOCUS}</span>
                <span className="td-row__meta" data-on={s.done || undefined}>
                  <Roll variant="fade">{s.done ? T.online : T.installing}</Roll>
                </span>
              </div>
              <div className="td-row">
                <Check on={false} size={22} />
                <span className="td-row__name">Kampung Sebauh Hilir</span>
                <span className="td-row__meta">{T.tomorrow}</span>
              </div>
            </div>
          </div>
        </Phone>
      )}
    </Stage>
  )
}

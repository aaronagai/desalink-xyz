import { Stage } from './kit/stage'
import { Check } from './kit/parts/Check'
import { Count } from './kit/motion/Count'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { Tablet } from './tablet'
import { LAND, SITE_DOTS, VB_H, VB_W } from './sarawak'
import { langOf } from './lang'
import './terminal-demo.css'

// A bird's-eye view, on an iPad in portrait: the Desalink Terminal's dotted
// map of every site in Sarawak (the same geometry and sites as the live
// demo) across the screen, today's installs in a card over the open sea, the
// full site list below. The iPad is pinned top-left and runs off the right
// and bottom, so the crop falls in the map's far east and the list. The install at Rumah Panjang Rimbas finishes: its row ticks to
// Online, the connected count rolls from 19 to 20 and its dot lights up;
// then the pointer selects the row and the map names the site with its
// first readings.

type S = { done: boolean; picked: boolean }
const initial: S = { done: false, picked: false }
const poster: S = { done: true, picked: true }

const FOCUS = 'Rumah Panjang Rimbas'
const focus = SITE_DOTS.find((d) => d.name === FOCUS)!
const CONNECTED = SITE_DOTS.filter((d) => d.status === 'connected').length

const COPY = {
  en: {
    of: 'of 30 connected',
    today: 'Installing today',
    all: 'All sites',
    installing: 'Installing',
    online: 'Online',
    tomorrow: 'Tomorrow',
    map: 'Sarawak',
    date: 'Tue 3 Nov',
  },
  ms: {
    of: 'daripada 30 bersambung',
    today: 'Pemasangan hari ini',
    all: 'Semua tapak',
    installing: 'Dipasang',
    online: 'Dalam talian',
    tomorrow: 'Esok',
    map: 'Sarawak',
    date: 'Sel 3 Nov',
  },
}
const T = COPY[langOf(document.getElementById('terminalDemo'))]

async function script(a: Act<S>) {
  await a.wait(1600)
  // The install completes: the row ticks, the count and the map follow
  await a.set({ done: true })
  await a.wait(1100)
  // Select it: the map names the site
  await a.click({ at: 'focus-row', x: 0.7, y: 0.55 })
  await a.set({ picked: true })
  await a.wait(3200)
}

// The map spans the portrait screen's width at 1pt per map unit
const MAP = { scale: 1, x: 0, y: 0 }

// Filler rows for the rest of the list: dot tone and bar widths
const FILLER: [string, number, number][] = [
  ['connected', 132, 54],
  ['connected', 108, 62],
  ['pending', 146, 48],
  ['connected', 118, 58],
  ['connected', 96, 50],
  ['inactive', 124, 56],
]

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
      cursor={{ at: { wide: { x: 400, y: 300 }, compact: { x: 290, y: 250 } }, style: 'circle' }}
      className="td"
    >
      {(s, _rect, layout) => (
        <Tablet portrait date={T.date} width={layout === 'compact' ? 560 : 640} className="td-ipad">
          <div className="td-app">
            <div className="td-head">
              <div className="td-title">{T.map}</div>
              <div className="td-sub">
                <Count value={CONNECTED + (s.done ? 1 : 0)} />
                <span>{T.of}</span>
              </div>
            </div>
            <div className="td-map">
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={VB_W * MAP.scale} height={VB_H * MAP.scale} style={{ left: MAP.x, top: MAP.y }} aria-hidden>
                <g className="td-land">
                  {LAND.map(([x, y]) => (
                    <circle key={`${x},${y}`} cx={x} cy={y} r={2.1} />
                  ))}
                </g>
                {SITE_DOTS.map((d) => {
                  const status = d.name === FOCUS && s.done ? 'connected' : d.status
                  return <circle key={d.name} className="td-site" data-status={status} data-focus={d.name === FOCUS || undefined} cx={d.x} cy={d.y} r={5.5} />
                })}
              </svg>
              <span className="td-tag" data-show={s.picked || undefined} style={{ left: MAP.x + focus.x * MAP.scale, top: MAP.y + focus.y * MAP.scale }}>
                <span className="td-tag__name">{FOCUS}</span>
                <span className="td-tag__stats">186 Mbps · 41 ms</span>
              </span>
              {/* Today's installs, floating over the open sea in the map's top-left */}
              <div className="td-card">
                <div className="td-section">{T.today}</div>
                <div className="td-row" data-target="focus-row" data-selected={s.picked || undefined}>
                  <Check on={s.done} pending size={20} />
                  <span className="td-row__name">{FOCUS}</span>
                  <span className="td-row__meta" data-on={s.done || undefined}>
                    <Roll variant="fade">{s.done ? T.online : T.installing}</Roll>
                  </span>
                </div>
                <div className="td-row">
                  <Check on={false} size={20} />
                  <span className="td-row__name">Kampung Sebauh Hilir</span>
                  <span className="td-row__meta">{T.tomorrow}</span>
                </div>
              </div>
            </div>
            <div className="td-list">
              <div className="td-section td-section--list">{T.all}</div>
              {FILLER.map(([status, w1, w2], i) => (
                <div key={i} className="td-row td-row--filler">
                  <i className="td-pip" data-status={status} />
                  <span className="td-bar" style={{ width: w1 }} />
                  <span className="td-bar td-bar--meta" style={{ width: w2 }} />
                </div>
              ))}
            </div>
          </div>
        </Tablet>
      )}
    </Stage>
  )
}

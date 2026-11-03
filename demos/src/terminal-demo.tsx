import { Stage } from './kit/stage'
import { Window } from './kit/window'
import { Check } from './kit/parts/Check'
import { Count } from './kit/motion/Count'
import { Roll } from './kit/motion/Roll'
import { Popover } from './kit/motion/Popover'
import type { Act } from './kit/act'
import { LAND, SITE_DOTS, VB_H, VB_W } from './sarawak'
import { langOf, pageTheme } from './lang'
import './terminal-demo.css'

// A bird's-eye view: the Desalink Terminal's map of every site in Sarawak.
// An install finishes at Rumah Panjang Batu Niah: its row in "Installing
// today" ticks, its dot on the map lights up, and the connected count rolls
// from 19 to 20. Then the pointer opens the new site and its first readings.

type S = { done: boolean; open: boolean }
const initial: S = { done: false, open: false }
const poster: S = { done: true, open: true }

const FOCUS = 'Rumah Panjang Batu Niah'
const focus = SITE_DOTS.find((d) => d.name === FOCUS)!
const CONNECTED = SITE_DOTS.filter((d) => d.status === 'connected').length

const COPY = {
  en: {
    region: 'Sarawak · 30 sites',
    connected: 'connected',
    today: 'Installing today',
    installing: 'Installing',
    online: 'Online',
    tomorrow: 'Tomorrow',
    status: 'Connected',
    latency: 'Latency',
    download: 'Download',
  },
  ms: {
    region: 'Sarawak · 30 tapak',
    connected: 'bersambung',
    today: 'Pemasangan hari ini',
    installing: 'Dipasang',
    online: 'Dalam talian',
    tomorrow: 'Esok',
    status: 'Bersambung',
    latency: 'Kependaman',
    download: 'Muat turun',
  },
}
const T = COPY[langOf(document.getElementById('terminalDemo'))]

async function script(a: Act<S>) {
  await a.wait(1600)
  // The install completes: the row ticks, then the map and the count follow
  await a.set({ done: true })
  await a.wait(1500)
  // Open the new site from its dot
  await a.move('focus', { duration: 900 })
  await a.click('focus')
  await a.set({ open: true })
  await a.wait(3000)
}

// Map geometry per layout: the scale the 630×430 map is drawn at in the
// window, and how far it is shifted left (the compact design crops the west)
const MAP = {
  wide: { width: 448, scale: 0.8, shift: 40 },
  compact: { width: 310, scale: 0.78, shift: 96 },
}

export function TerminalDemo() {
  const theme = pageTheme()
  return (
    <Stage<S>
      width={496}
      height={440}
      compact={{ below: 460, width: 342, height: 420 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      theme={theme}
      accent={theme === 'dark' ? '#f2f1ed' : '#141414'}
      cursor={{ at: { wide: { x: 300, y: 400 }, compact: { x: 120, y: 390 } } }}
      className="td"
    >
      {(s, _rect, layout) => {
        const m = MAP[layout]
        const fx = focus.x * m.scale - m.shift
        const fy = focus.y * m.scale
        return (
          <>
            <Window title="Desalink Terminal" className="td-win">
              <div className="td-body">
                <div className="td-head">
                  <span className="td-count">
                    <Count value={CONNECTED + (s.done ? 1 : 0)} />
                    <span>{T.connected}</span>
                  </span>
                  <span className="td-region">{T.region}</span>
                </div>
                <div className="td-map" style={{ height: VB_H * m.scale }}>
                  <svg
                    viewBox={`0 0 ${VB_W} ${VB_H}`}
                    width={VB_W * m.scale}
                    height={VB_H * m.scale}
                    style={{ marginLeft: -m.shift }}
                    aria-hidden
                  >
                    <g className="td-land">
                      {LAND.map(([x, y]) => (
                        <circle key={`${x},${y}`} cx={x} cy={y} r={2} />
                      ))}
                    </g>
                    {SITE_DOTS.map((d) => {
                      const status = d.name === FOCUS && s.done ? 'connected' : d.status
                      return <circle key={d.name} className="td-site" data-status={status} data-focus={d.name === FOCUS || undefined} cx={d.x} cy={d.y} r={5} />
                    })}
                  </svg>
                  <span className="td-hit" data-target="focus" data-cursor="pointer" style={{ left: fx, top: fy }} />
                  <Popover
                    show={s.open}
                    origin={layout === 'compact' ? 'top' : 'top right'}
                    className="td-pop"
                    style={
                      layout === 'compact'
                        ? { left: Math.min(fx - 95, m.width - 202), top: fy + 16, width: 190 }
                        : { right: `calc(100% - ${fx + 14}px)`, top: fy + 14 }
                    }
                  >
                    <div className="td-pop__name">{FOCUS}</div>
                    <div className="td-pop__status">
                      <i aria-hidden />
                      {T.status}
                    </div>
                    <dl className="td-pop__stats">
                      <div>
                        <dt>{T.latency}</dt>
                        <dd>41 ms</dd>
                      </div>
                      <div>
                        <dt>{T.download}</dt>
                        <dd>186 Mbps</dd>
                      </div>
                    </dl>
                  </Popover>
                </div>
              </div>
            </Window>
            <div className="td-card">
              <div className="td-card__title">{T.today}</div>
              <div className="td-row">
                <Check on={s.done} pending size={16} />
                <span className="td-row__name">Batu Niah</span>
                <span className="td-row__meta" data-on={s.done || undefined}>
                  <Roll variant="fade">{s.done ? T.online : T.installing}</Roll>
                </span>
              </div>
              <div className="td-row">
                <Check on={false} size={16} />
                <span className="td-row__name">Sebauh Hilir</span>
                <span className="td-row__meta">{T.tomorrow}</span>
              </div>
            </div>
          </>
        )
      }}
    </Stage>
  )
}

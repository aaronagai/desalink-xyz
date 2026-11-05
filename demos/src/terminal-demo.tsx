import { Home, Map, Layers, BarChart3, Users, Settings, Maximize2, X, Plus, Minus, Ruler, SlidersHorizontal, Wifi, Check } from 'lucide-react'
import { Stage } from './kit/stage'
import { Roll } from './kit/motion/Roll'
import type { Act } from './kit/act'
import { Tablet } from './tablet'
import { langOf } from './lang'
import './terminal-demo.css'

// A bird's-eye view of one area, for the YB who looks after it: the Desalink
// Terminal on an iPad in landscape, "Serian Overview". A greyscale map of the
// district's zones (mukims) with every village on it; a floating panel with
// the area's numbers; the operator taps one zone, which floods orange, the
// panel switches to that zone, and a card opens on its village still without
// coverage. One tap on Request installation and the rollout plan slides in
// from the right edge in orange. Visual language after a portfolio-dashboard
// concept (large light title, greyscale map, one orange region, floating
// cards with striped mini charts, an orange edge panel); the content is
// Desalink's. Zone shapes are illustrative, not survey boundaries.

type S = { zone: boolean; requested: boolean }
const initial: S = { zone: false, requested: false }
const poster: S = { zone: true, requested: true }

const COPY = {
  en: {
    title: ['Serian', 'Overview'],
    crumb: 'Serian district',
    district: 'Serian district',
    zoneName: 'Mukim Tebakang',
    zonesChip: '7 zones',
    villagesChip: '4 villages',
    districtNote: '3 without coverage',
    zoneNote: '2 without coverage',
    homes: 'Households',
    coverage: 'Coverage',
    perVillage: 'Homes per village',
    install: 'Install time',
    onSite: 'On site',
    cardId: 'SRN-TBK-07',
    village: ['Kampung', 'Tebakang'],
    villageHomes: 'homes',
    noCover: 'No coverage',
    scheduled: 'Scheduled',
    request: 'Request installation',
    requested: 'Requested',
    plan: 'Rollout plan',
    planVillages: 'villages',
    planHomes: 'homes',
    planWhen: 'technicians on site',
    date: 'Thu 5 Nov',
  },
  ms: {
    title: ['Gambaran', 'Serian'],
    crumb: 'Daerah Serian',
    district: 'Daerah Serian',
    zoneName: 'Mukim Tebakang',
    zonesChip: '7 zon',
    villagesChip: '4 kampung',
    districtNote: '3 tanpa liputan',
    zoneNote: '2 tanpa liputan',
    homes: 'Isi rumah',
    coverage: 'Liputan',
    perVillage: 'Rumah setiap kampung',
    install: 'Masa pasang',
    onSite: 'Tiba',
    cardId: 'SRN-TBK-07',
    village: ['Kampung', 'Tebakang'],
    villageHomes: 'rumah',
    noCover: 'Tiada liputan',
    scheduled: 'Dijadualkan',
    request: 'Mohon pemasangan',
    requested: 'Dimohon',
    plan: 'Pelan pelaksanaan',
    planVillages: 'kampung',
    planHomes: 'rumah',
    planWhen: 'juruteknik tiba',
    date: 'Kha 5 Nov',
  },
}
const T = COPY[langOf(document.getElementById('terminalDemo'))]

// The map, in the map pane's own points (it starts after the 64pt rail)
const ZONES: { id: string; pts: number[][] }[] = [
  { id: 'tebedu', pts: [[400, 40], [640, 18], [712, 160], [560, 232], [430, 178]] },
  { id: 'tebakang', pts: [[560, 232], [712, 160], [846, 212], [866, 362], [704, 420], [604, 360]] },
  { id: 'mongkos', pts: [[704, 420], [866, 362], [986, 424], [962, 584], [782, 604]] },
  { id: 'taee', pts: [[430, 178], [560, 232], [604, 360], [482, 430], [372, 330]] },
  { id: 'riih', pts: [[372, 330], [482, 430], [462, 582], [330, 604], [296, 452]] },
  { id: 'pichin', pts: [[482, 430], [604, 360], [704, 420], [782, 604], [604, 646], [462, 582]] },
  { id: 'kedup', pts: [[846, 212], [1004, 168], [1084, 302], [986, 424], [866, 362]] },
]
// Neighbouring land around the district, quieter
const LAND = [[250, 0], [1116, 0], [1116, 820], [240, 820], [200, 600], [230, 380], [210, 200]]
// Connected villages: dark dots across the zones
const VILLAGES: [number, number][] = [
  [470, 92], [560, 120], [640, 70], [470, 260], [520, 330], [400, 400], [380, 520], [430, 470],
  [560, 470], [650, 540], [560, 600], [760, 480], [840, 530], [900, 450], [920, 280], [1000, 250],
  [960, 360], [630, 210], [800, 300], [790, 390],
]
// Main roads, thin and white, so the map reads as ground
const ROADS = [
  'M230 690 C 360 600, 470 520, 600 470 S 820 380, 1116 330',
  'M520 0 C 540 120, 600 220, 660 300 S 760 520, 800 820',
  'M300 300 C 400 330, 480 300, 560 260',
]
// The village without coverage in Tebakang, which the card opens on
const FOCUS = { x: 712, y: 288 }

const pathOf = (pts: number[][]) => `M${pts.map((p) => p.join(' ')).join('L')}Z`
const BARS = [62, 38, 84, 46, 70, 28, 54, 90, 40, 66]
const BARS_ZONE = [90, 44, 0, 0, 0, 0, 30, 0, 0, 72]

async function script(a: Act<S>) {
  await a.wait(1400)
  await a.click({ at: 'zone', x: 0.62, y: 0.42 })
  await a.set({ zone: true })
  await a.wait(1500)
  await a.click({ at: 'request', x: 0.1, y: 0.5 })
  await a.set({ requested: true })
  await a.wait(3600)
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="td-stat">
      <span className="td-stat__label">{label}</span>
      <span className="td-stat__value">
        {value}
        {sub && <small>{sub}</small>}
      </span>
    </div>
  )
}

function PanelBody({ zone }: { zone: boolean }) {
  return (
    <>
      <div className="td-panel__name">{zone ? T.zoneName : T.district}</div>
      <div className="td-panel__chips">
        <span className="td-chip">{zone ? T.villagesChip : T.zonesChip}</span>
        <span className="td-chip td-chip--warn">
          <i />
          {zone ? T.zoneNote : T.districtNote}
        </span>
      </div>
      <div className="td-panel__grid">
        <Stat label={T.homes} value={zone ? '312' : '1,240'} />
        <Stat label={T.coverage} value={zone ? '38' : '71'} sub="%" />
      </div>
      <div className="td-meter">
        <i style={{ width: zone ? '38%' : '71%' }} />
      </div>
      <div className="td-panel__label">{T.perVillage}</div>
      <div className="td-bars">
        {(zone ? BARS_ZONE : BARS).map((h, i) => (
          <i key={i} style={{ height: `${Math.max(h, 6)}%` }} data-empty={h === 0 || undefined} />
        ))}
      </div>
    </>
  )
}

export function TerminalDemo() {
  return (
    <Stage<S>
      width={1072}
      height={600}
      compact={{ below: 700, width: 342, height: 440 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 980, y: 560 }, compact: { x: 300, y: 420 } }, style: 'circle' }}
      className="td"
    >
      {(s, _rect, layout) => (
        <Tablet date={T.date} width={layout === 'compact' ? 1000 : 1096} className="td-ipad">
          <div className="td-app" data-zone={s.zone || undefined} data-requested={s.requested || undefined}>
            <nav className="td-rail" aria-hidden>
              <span className="td-rail__logo">
                <img src="/favicon.svg" alt="" width={30} height={30} />
              </span>
              <Home size={20} />
              <Map size={20} className="is-on" />
              <Layers size={20} />
              <BarChart3 size={20} />
              <Users size={20} />
              <span className="td-rail__spacer" />
              <Settings size={20} />
            </nav>

            <div className="td-pane">
              <svg className="td-map" viewBox="0 0 1116 820" width={1116} height={820} aria-hidden>
                <defs>
                  <pattern id="td-dots" width="9" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="4.5" cy="4.5" r="1.1" fill="#b9b9bd" />
                  </pattern>
                </defs>
                <path d={pathOf(LAND)} className="td-land" />
                <path d={pathOf(LAND)} fill="url(#td-dots)" opacity="0.5" />
                {ZONES.map((z) => (
                  <path key={z.id} d={pathOf(z.pts)} className="td-zone" data-id={z.id} />
                ))}
                {ROADS.map((d, i) => (
                  <path key={i} d={d} className="td-road" />
                ))}
                {VILLAGES.map(([x, y]) => (
                  <circle key={`${x},${y}`} cx={x} cy={y} r={4} className="td-vil" />
                ))}
                <circle cx={FOCUS.x} cy={FOCUS.y} r={7} className="td-focus" />
              </svg>
              <span className="td-zone-hit" data-target="zone" />

              <div className="td-title">
                {T.title[0]}
                <br />
                {T.title[1]}
              </div>

              <div className="td-tools" aria-hidden>
                <SlidersHorizontal size={18} />
                <Ruler size={18} />
                <Layers size={18} />
                <i />
                <Plus size={18} />
                <Minus size={18} />
              </div>

              <aside className="td-panel">
                <div className="td-panel__top">
                  <span>{T.crumb}</span>
                  <span className="td-panel__icons">
                    <Maximize2 size={15} />
                    <X size={15} />
                  </span>
                </div>
                <div className="td-panel__swap">
                  <div className="td-panel__layer" data-on={!s.zone || undefined}>
                    <PanelBody zone={false} />
                  </div>
                  <div className="td-panel__layer" data-on={s.zone || undefined}>
                    <PanelBody zone />
                  </div>
                </div>
              </aside>

              <div className="td-card" data-show={s.zone || undefined}>
                <div className="td-card__top">
                  <span>{T.cardId}</span>
                  <Maximize2 size={14} />
                </div>
                <div className="td-card__title">
                  {T.village[0]}
                  <br />
                  {T.village[1]}
                </div>
                <div className="td-card__img">
                  <img src="/images/dish-card.jpg" alt="" width={560} height={380} />
                </div>
                <div className="td-card__stats">
                  <span>
                    <b>120</b> {T.villageHomes}
                  </span>
                  <span className="td-card__status" data-on={s.requested || undefined}>
                    <Roll variant="fade">{s.requested ? T.scheduled : T.noCover}</Roll>
                  </span>
                </div>
                <div className="td-card__bar">
                  <span className="td-card__btn" data-target="request" data-done={s.requested || undefined}>
                    <span className="td-card__icon">
                      <Wifi size={16} data-on={!s.requested || undefined} />
                      <Check size={16} strokeWidth={2.5} data-on={s.requested || undefined} />
                    </span>
                    <Roll variant="fade">{s.requested ? T.requested : T.request}</Roll>
                  </span>
                </div>
              </div>

              <aside className="td-plan">
                <div className="td-plan__label">{T.plan}</div>
                <div className="td-plan__big">2</div>
                <div className="td-plan__unit">{T.planVillages}</div>
                <div className="td-plan__rule" />
                <div className="td-plan__mid">184</div>
                <div className="td-plan__unit">{T.planHomes}</div>
                <div className="td-plan__rule" />
                <div className="td-plan__mid">24–48h</div>
                <div className="td-plan__unit">{T.planWhen}</div>
              </aside>
            </div>
          </div>
        </Tablet>
      )}
    </Stage>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LayoutGrid, Map as MapIcon, Route, BarChart3, Settings, X, ChevronLeft, ChevronRight, Plus, Minus, Maximize, Check, Wifi, Send } from 'lucide-react'
import { Count } from '../kit/motion/Count'
import { Roll } from '../kit/motion/Roll'
import { ZONES, VILLAGES, ROADS, LAND, TOWN, pathOf, type Status, type Village } from './data'
import './app.css'

// The Desalink Terminal, interactive: Serian district's zones on a greyscale
// map. Hover a zone for its coverage, click it to zoom in and flood it orange;
// the side panel's numbers roll over to that zone. Open a village (from its
// pin or the zone's list) as a tray stacked on the panel, add it to the
// rollout plan, and send the plan from the orange tray on the right. Esc
// steps back: village, zone, then closes. Data is illustrative.

const ms = typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('ms')
const T = ms
  ? {
      app: 'Desalink Terminal', title: ['Gambaran', 'Serian'], district: 'Daerah Serian', zones: 'zon', villages: 'kampung',
      without: 'tanpa liputan', homes: 'Isi rumah', coverage: 'Liputan', zoneList: 'Zon', villageList: 'Kampung', perVillage: 'Rumah setiap kampung',
      all: 'Semua', none: 'Tiada liputan', scheduled: 'Dijadualkan', connected: 'Bersambung', road: 'Ke jalan', speed: 'Kelajuan',
      add: 'Tambah ke pelan', inPlan: 'Dalam pelan', remove: 'Buang', onSite: 'Juruteknik tiba dalam 24–48 jam', plan: 'Pelan pelaksanaan',
      planHomes: 'rumah', send: 'Hantar permohonan', sent: 'Permohonan dihantar', done: 'Selesai', close: 'Tutup', back: 'Kembali',
      hint: 'Klik zon untuk bermula', reset: 'Lihat seluruh daerah', status: 'Status',
    }
  : {
      app: 'Desalink Terminal', title: ['Serian', 'Overview'], district: 'Serian district', zones: 'zones', villages: 'villages',
      without: 'without coverage', homes: 'Households', coverage: 'Coverage', zoneList: 'Zones', villageList: 'Villages', perVillage: 'Homes per village',
      all: 'All', none: 'No coverage', scheduled: 'Scheduled', connected: 'Connected', road: 'To road', speed: 'Speed',
      add: 'Add to rollout plan', inPlan: 'In rollout plan', remove: 'Remove', onSite: 'Technicians on site within 24–48 hours', plan: 'Rollout plan',
      planHomes: 'homes', send: 'Send request', sent: 'Request sent', done: 'Done', close: 'Close', back: 'Back',
      hint: 'Click a zone to begin', reset: 'Whole district', status: 'Status',
    }

type Filter = 'all' | 'none' | 'scheduled'
const fmt = (n: number) => n.toLocaleString('en-US')

// One shared highlight that glides to the row under the pointer (fluid hover)
function useGlide() {
  const list = useRef<HTMLDivElement>(null)
  const [hl, setHl] = useState<{ y: number; h: number; on: boolean }>({ y: 0, h: 0, on: false })
  const move = (e: React.PointerEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-row]')
    if (!row || !list.current) return
    setHl({ y: row.offsetTop, h: row.offsetHeight, on: true })
  }
  const leave = () => setHl((h) => ({ ...h, on: false }))
  return { list, hl, move, leave }
}

function List({ children, label }: { children: ReactNode; label: string }) {
  const { list, hl, move, leave } = useGlide()
  return (
    <div className="tm-list" ref={list} role="list" aria-label={label} onPointerMove={move} onPointerLeave={leave}>
      <span className="tm-list__hl" data-on={hl.on || undefined} style={{ transform: `translateY(${hl.y}px)`, height: hl.h }} aria-hidden />
      {children}
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="tm-stat">
      <span className="tm-stat__label">{label}</span>
      <span className="tm-stat__value">
        <Count value={value} format={fmt} duration={600} />
        {unit && <small>{unit}</small>}
      </span>
    </div>
  )
}

const statusText = (s: Status) => (s === 'connected' ? T.connected : s === 'scheduled' ? T.scheduled : T.none)

export function TerminalApp({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState(false)
  const [zoneId, setZoneId] = useState<string | null>(null)
  const [villageId, setVillageId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string[]>([])
  const [scheduled, setScheduled] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [hover, setHover] = useState<{ label: string; sub: string; x: number; y: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const lastTip = useRef(hover)
  if (hover) lastTip.current = hover
  const closeBtn = useRef<HTMLButtonElement>(null)
  const sendBtn = useRef<HTMLButtonElement>(null)
  const villageScroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    villageScroll.current?.scrollTo({ top: 0 })
  }, [villageId])

  const statusOf = useCallback((v: Village): Status => (scheduled.includes(v.id) ? 'scheduled' : v.status), [scheduled])
  const zone = ZONES.find((z) => z.id === zoneId) ?? null
  const village = VILLAGES.find((v) => v.id === villageId) ?? null

  const stats = useMemo(() => {
    const vs = zoneId ? VILLAGES.filter((v) => v.zone === zoneId) : VILLAGES
    const homes = vs.reduce((n, v) => n + v.homes, 0)
    const covered = vs.filter((v) => statusOf(v) === 'connected').reduce((n, v) => n + v.homes, 0)
    return { vs, homes, coverage: Math.round((covered / homes) * 100), without: vs.filter((v) => statusOf(v) === 'none').length }
  }, [zoneId, statusOf])

  const zoneCoverage = (id: string) => {
    const vs = VILLAGES.filter((v) => v.zone === id)
    const homes = vs.reduce((n, v) => n + v.homes, 0)
    return Math.round((vs.filter((v) => statusOf(v) === 'connected').reduce((n, v) => n + v.homes, 0) / homes) * 100)
  }

  const planVillages = VILLAGES.filter((v) => plan.includes(v.id))
  const planHomes = planVillages.reduce((n, v) => n + v.homes, 0)

  // Open with a settle, focus the close button; Esc steps back
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    closeBtn.current?.focus({ preventScroll: true })
    return () => cancelAnimationFrame(id)
  }, [])
  const close = useCallback(() => {
    setShown(false)
    setTimeout(onClose, 260)
  }, [onClose])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (villageId) setVillageId(null)
      else if (zoneId) setZoneId(null)
      else close()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [villageId, zoneId, close])

  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  const planOpen = plan.length > 0 && !narrow
  // Camera: zoom to the selected zone, or the user's own zoom on the district
  const camera = useMemo(() => {
    if (zone) {
      const [x0, y0, x1, y1] = zone.box
      const s = Math.min(1.9, (0.7 * 1000) / (x1 - x0), (0.7 * 700) / (y1 - y0))
      // With the plan tray open, centre the zone in the space left of it
      const cxv = planOpen ? 340 : 500
      return { s: planOpen ? s * 0.85 : s, tx: cxv - ((x0 + x1) / 2) * (planOpen ? s * 0.85 : s), ty: 350 - ((y0 + y1) / 2) * (planOpen ? s * 0.85 : s) }
    }
    const k = planOpen ? zoom * 0.9 : zoom
    return { s: k, tx: (planOpen ? 360 : 500) - 470 * k, ty: 350 - 330 * k }
  }, [zone, zoom, planOpen])

  const pickZone = (id: string | null) => {
    setVillageId(null)
    setZoneId(id)
    setHover(null)
  }
  const pickVillage = (v: Village) => {
    if (v.zone !== zoneId) setZoneId(v.zone)
    setVillageId(v.id)
  }
  const togglePlan = (id: string) => {
    setSent(false)
    setPlan((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  const send = () => {
    setScheduled((s) => [...s, ...plan])
    setSent(true)
    const c = (window as unknown as { confetti?: (o: object) => void }).confetti
    const r = sendBtn.current?.getBoundingClientRect()
    if (c && r && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      c({ particleCount: 90, spread: 70, startVelocity: 38, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: ['#ff5a1f', '#f5c518', '#ffffff', '#161616'], zIndex: 10001 })
    }
  }
  const finish = () => {
    setPlan([])
    setSent(false)
  }

  const tip = (label: string, sub: string) => (e: React.PointerEvent) => setHover({ label, sub, x: e.clientX, y: e.clientY })

  return (
    <div className="tm" data-shown={shown || undefined} role="dialog" aria-modal="true" aria-label={`${T.app}: ${T.title.join(' ')}`}>
      <div className="tm__backdrop" onClick={close} />
      <div className="tm__app">
        <nav className="tm-rail" aria-label={T.app}>
          <img className="tm-rail__logo" src="/favicon.svg" alt="Desalink" width={32} height={32} />
          <button type="button" className="tm-rail__btn" data-on aria-label="Overview" aria-current="page"><LayoutGrid size={20} /></button>
          <button type="button" className="tm-rail__btn" aria-label="Map"><MapIcon size={20} /></button>
          <button type="button" className="tm-rail__btn" aria-label="Rollouts"><Route size={20} /></button>
          <button type="button" className="tm-rail__btn" aria-label="Reports"><BarChart3 size={20} /></button>
          <span className="tm-rail__spacer" />
          <button type="button" className="tm-rail__btn" aria-label="Settings"><Settings size={20} /></button>
        </nav>

        <div className="tm-main">
          <header className="tm-top">
            <nav className="tm-crumb" aria-label="Breadcrumb">
              <button type="button" onClick={() => pickZone(null)} data-on={!zone || undefined}>{T.district}</button>
              <span className="tm-crumb__zone" data-on={zone ? '' : undefined}>
                <ChevronRight size={14} aria-hidden />
                <span>{zone?.name ?? ''}</span>
              </span>
            </nav>
            <div className="tm-seg" role="radiogroup" aria-label="Filter">
              <span className="tm-seg__pill" style={{ transform: `translateX(${['all', 'none', 'scheduled'].indexOf(filter) * 100}%)` }} aria-hidden />
              {(['all', 'none', 'scheduled'] as Filter[]).map((f) => (
                <button key={f} type="button" role="radio" aria-checked={filter === f} data-on={filter === f || undefined} onClick={() => setFilter(f)}>
                  {f === 'all' ? T.all : f === 'none' ? T.none : T.scheduled}
                </button>
              ))}
            </div>
            <button ref={closeBtn} type="button" className="tm-close" onClick={close} aria-label={T.close}>
              <X size={18} />
              <kbd>Esc</kbd>
            </button>
          </header>

          <div className="tm-stage">
            <div className="tm-title" aria-hidden>
              {T.title[0]}
              <br />
              {T.title[1]}
            </div>

            <svg className="tm-map" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" onClick={(e) => e.target === e.currentTarget && pickZone(null)}>
              <defs>
                <pattern id="tm-dots" width="9" height="9" patternUnits="userSpaceOnUse">
                  <circle cx="4.5" cy="4.5" r="1.1" fill="#b9b9bd" />
                </pattern>
              </defs>
              <g className="tm-cam" style={{ transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.s})` }}>
                <path d={pathOf(LAND)} className="tm-land" onClick={() => pickZone(null)} />
                <path d={pathOf(LAND)} fill="url(#tm-dots)" opacity="0.5" pointerEvents="none" />
                {ZONES.map((z) => (
                  <path
                    key={z.id}
                    d={pathOf(z.pts)}
                    className="tm-zone"
                    data-on={z.id === zoneId || undefined}
                    data-dim={(zoneId && z.id !== zoneId) || undefined}
                    tabIndex={0}
                    role="button"
                    aria-label={`${z.name}, ${zoneCoverage(z.id)}% ${T.coverage.toLowerCase()}`}
                    onClick={() => pickZone(z.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickZone(z.id))}
                    onPointerMove={tip(z.name, `${zoneCoverage(z.id)}% ${T.coverage.toLowerCase()}`)}
                    onPointerLeave={() => setHover(null)}
                  />
                ))}
                {ROADS.map((d, i) => (
                  <path key={i} d={d} className="tm-road" />
                ))}
                <g className="tm-town" style={{ transform: `translate(${TOWN.x}px, ${TOWN.y}px) scale(${1 / camera.s})` }}>
                  <rect x={-6} y={-6} width={12} height={12} rx={3} />
                  <text x={12} y={4}>{TOWN.name}</text>
                </g>
                {VILLAGES.map((v) => {
                  const st = statusOf(v)
                  const match = filter === 'all' || filter === st
                  return (
                    <g
                      key={v.id}
                      className="tm-pin"
                      data-status={st}
                      data-on={v.id === villageId || undefined}
                      data-plan={(plan.includes(v.id) && st !== 'scheduled') || undefined}
                      data-dim={!match || undefined}
                      style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${1 / camera.s})` }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${v.name}, ${statusText(st)}`}
                      onClick={(e) => (e.stopPropagation(), pickVillage(v))}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickVillage(v))}
                      onPointerMove={(e) => (e.stopPropagation(), tip(v.name, `${v.homes} ${T.planHomes} · ${statusText(st)}`)(e))}
                      onPointerLeave={() => setHover(null)}
                    >
                      <circle className="tm-pin__halo" r={13} />
                      <circle className="tm-pin__dot" r={6} />
                    </g>
                  )
                })}
              </g>
            </svg>

            <div className="tm-zoom" role="group" aria-label="Zoom">
              <button type="button" onClick={() => (zone ? null : setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1))))} aria-label="Zoom in" disabled={!!zone}><Plus size={16} /></button>
              <button type="button" onClick={() => (zone ? null : setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1))))} aria-label="Zoom out" disabled={!!zone}><Minus size={16} /></button>
              <button type="button" onClick={() => (pickZone(null), setZoom(1))} aria-label={T.reset}><Maximize size={15} /></button>
            </div>

            <div className="tm-hint" data-on={!zone || undefined} aria-hidden>{T.hint}</div>

            {/* Trays: the area panel, with a village tray stacked over it */}
            <aside className="tm-trays" data-depth={village ? 2 : 1}>
              <section className="tm-tray tm-tray--area" aria-label={zone?.name ?? T.district}>
               <div className="tm-tray__in">
                <div className="tm-tray__swap" key={zoneId ?? 'district'}>
                  <div className="tm-tray__name">{zone?.name ?? T.district}</div>
                  <div className="tm-chips">
                    <span className="tm-chip">{zone ? `${stats.vs.length} ${T.villages}` : `${ZONES.length} ${T.zones}`}</span>
                    <span className="tm-chip" data-tone={stats.without ? 'warn' : 'ok'}>
                      <i />
                      {stats.without} {T.without}
                    </span>
                  </div>
                </div>
                <div className="tm-grid">
                  <Stat label={T.homes} value={stats.homes} />
                  <Stat label={T.coverage} value={stats.coverage} unit="%" />
                </div>
                <div className="tm-meter" aria-hidden>
                  <i style={{ transform: `scaleX(${stats.coverage / 100})` }} />
                </div>
                {zone ? (
                  <>
                    <div className="tm-label">{T.perVillage}</div>
                    <div className="tm-bars" aria-hidden>
                      {stats.vs.map((v) => (
                        <i key={v.id} data-status={statusOf(v)} style={{ transform: `scaleY(${v.homes / 140})` }} />
                      ))}
                    </div>
                    <div className="tm-label">{T.villageList}</div>
                    <List label={T.villageList}>
                      {stats.vs.map((v) => {
                        const st = statusOf(v)
                        return (
                          <button key={v.id} type="button" role="listitem" data-row className="tm-row" onClick={() => pickVillage(v)}>
                            <i className="tm-dot" data-status={st} data-plan={(plan.includes(v.id) && st !== 'scheduled') || undefined} />
                            <span className="tm-row__name">{v.name}</span>
                            <span className="tm-row__meta" data-status={st}>{st === 'scheduled' ? T.scheduled : plan.includes(v.id) ? T.inPlan : st === 'connected' ? `${v.homes}` : statusText(st)}</span>
                          </button>
                        )
                      })}
                    </List>
                  </>
                ) : (
                  <>
                    <div className="tm-label">{T.zoneList}</div>
                    <List label={T.zoneList}>
                      {ZONES.map((z) => {
                        const c = zoneCoverage(z.id)
                        return (
                          <button key={z.id} type="button" role="listitem" data-row className="tm-row" onClick={() => pickZone(z.id)}
                            onPointerEnter={() => setHover(null)}>
                            <span className="tm-row__name">{z.name}</span>
                            <span className="tm-row__bar" aria-hidden><i style={{ transform: `scaleX(${c / 100})` }} /></span>
                            <span className="tm-row__meta">{c}%</span>
                          </button>
                        )
                      })}
                    </List>
                  </>
                )}
               </div>
              </section>

              <section className="tm-tray tm-tray--village" aria-label={village?.name} aria-hidden={!village}>
               <div className="tm-tray__in" ref={villageScroll}>
                {village && (() => {
                  const st = statusOf(village)
                  const inPlan = plan.includes(village.id)
                  return (
                    <div className="tm-tray__swap" key={village.id}>
                      <button type="button" className="tm-back" onClick={() => setVillageId(null)}>
                        <ChevronLeft size={16} />
                        {ZONES.find((z) => z.id === village.zone)?.name}
                      </button>
                      <div className="tm-tray__id">SRN-{village.zone.slice(0, 3).toUpperCase()}-{String(Number(village.id.split('-')[1]) + 1).padStart(2, '0')}</div>
                      <div className="tm-tray__name">{village.name}</div>
                      <div className="tm-photo">
                        <img src="/images/dish-card.jpg" alt="" width={560} height={380} />
                        <span className="tm-photo__status" data-status={st}>
                          <i />
                          <Roll variant="fade">{st === 'scheduled' ? T.scheduled : inPlan ? T.inPlan : statusText(st)}</Roll>
                        </span>
                      </div>
                      <div className="tm-grid tm-grid--3">
                        <Stat label={T.homes} value={village.homes} />
                        <div className="tm-stat">
                          <span className="tm-stat__label">{T.road}</span>
                          <span className="tm-stat__value">{village.km}<small>km</small></span>
                        </div>
                        <div className="tm-stat">
                          <span className="tm-stat__label">{T.speed}</span>
                          <span className="tm-stat__value">{village.mbps ?? '—'}{village.mbps && <small>Mbps</small>}</span>
                        </div>
                      </div>
                      {st === 'none' ? (
                        <button type="button" className="tm-action" data-on={inPlan || undefined} onClick={() => togglePlan(village.id)}>
                          <span className="tm-action__icon">
                            <Plus size={16} data-on={!inPlan || undefined} />
                            <Check size={16} strokeWidth={2.5} data-on={inPlan || undefined} />
                          </span>
                          <Roll variant="fade">{inPlan ? T.inPlan : T.add}</Roll>
                        </button>
                      ) : (
                        <div className="tm-note" data-status={st}>
                          {st === 'scheduled' ? <><Check size={15} /> {T.onSite}</> : <><Wifi size={15} /> {T.connected} · {village.mbps} Mbps</>}
                        </div>
                      )}
                    </div>
                  )
                })()}
               </div>
              </section>
            </aside>

            {/* The rollout plan: orange tray from the right */}
            <aside className="tm-plan" data-on={plan.length > 0 || undefined} aria-label={T.plan} aria-hidden={plan.length === 0}>
              <div className="tm-plan__head">
                <span>{T.plan}</span>
                <span className="tm-plan__count"><Count value={plan.length} /></span>
              </div>
              <div className="tm-plan__big">
                <Count value={planHomes} format={fmt} duration={600} />
              </div>
              <div className="tm-plan__unit">{T.planHomes}</div>
              <div className="tm-plan__list">
                {planVillages.map((v) => (
                  <div key={v.id} className="tm-plan__row">
                    <span>{v.name}</span>
                    {!sent && (
                      <button type="button" onClick={() => togglePlan(v.id)} aria-label={`${T.remove} ${v.name}`}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="tm-plan__foot">
                {sent ? (
                  <div className="tm-sent">
                    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
                      <circle cx="20" cy="20" r="18" />
                      <path d="M12 20.5l5.5 5.5L28.5 14.5" />
                    </svg>
                    <div>
                      <strong>{T.sent}</strong>
                      <span>{T.onSite}</span>
                    </div>
                    <button type="button" className="tm-plan__btn tm-plan__btn--ghost" onClick={finish}>{T.done}</button>
                  </div>
                ) : (
                  <button ref={sendBtn} type="button" className="tm-plan__btn" onClick={send} disabled={!plan.length}>
                    <Send size={16} />
                    {T.send}
                  </button>
                )}
              </div>
            </aside>

            <div className="tm-tip" data-on={hover ? '' : undefined} style={lastTip.current ? { transform: `translate(${lastTip.current.x + 14}px, ${lastTip.current.y + 14}px)` } : undefined} aria-hidden>
              <strong>{lastTip.current?.label}</strong>
              <span>{lastTip.current?.sub}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

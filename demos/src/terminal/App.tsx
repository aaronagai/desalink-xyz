import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LayoutGrid, Map as MapIcon, Route, BarChart3, Settings, X, ChevronLeft, ChevronRight, Plus, Minus, Maximize, Check, Wifi, Send } from 'lucide-react'
import { Count } from '../kit/motion/Count'
import { Roll } from '../kit/motion/Roll'
import { VIEW, DISTRICT, TOWN, ZONES, RIVERS, ROADS_MAJOR, ROADS_MINOR, VILLAGES as RAW } from './geo'
import './app.css'

// The Desalink Terminal: Serian district on its real terrain (OpenStreetMap
// outline, rivers, roads and villages over an SRTM hillshade), dark and live.
// The district is lit and its surroundings dimmed; villages glow, connected
// ones pulse; satellite passes sweep across. A live strip up top keeps the
// district's throughput, sites online and latency ticking. Hover a zone for
// its coverage, click to fly to it; open a village for its live speed, 30-day
// uptime and a terrain crop of its location; add villages to the orange
// rollout plan and send it. Esc steps back, then closes. Statuses and
// household counts are illustrative.

type Status = 'connected' | 'none' | 'scheduled'
type Village = Omit<(typeof RAW)[number], 'status'> & { status: Status }
const VILLAGES = RAW as unknown as Village[]

const ms = typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('ms')
const T = ms
  ? {
      app: 'Desalink Terminal', title: ['Gambaran', 'Serian'], district: 'Daerah Serian', zones: 'zon', villages: 'kampung',
      without: 'tanpa liputan', homes: 'Isi rumah', coverage: 'Liputan', zoneList: 'Zon', villageList: 'Kampung', perVillage: 'Rumah setiap kampung',
      all: 'Semua', none: 'Tiada liputan', scheduled: 'Dijadualkan', connected: 'Bersambung', road: 'Ke jalan', speed: 'Kelajuan',
      add: 'Tambah ke pelan', inPlan: 'Dalam pelan', remove: 'Buang', onSite: 'Juruteknik tiba dalam 24–48 jam', plan: 'Pelan pelaksanaan',
      planHomes: 'rumah', send: 'Hantar permohonan', sent: 'Permohonan dihantar', done: 'Selesai', close: 'Tutup',
      hint: 'Klik zon untuk bermula', reset: 'Lihat seluruh daerah', live: 'Langsung', throughput: 'Trafik', online: 'Dalam talian', latency: 'Kependaman',
      speed24: 'Kelajuan, 24 jam', uptime30: 'Masa operasi, 30 hari', site: 'Lokasi', lastPing: 'Ping terakhir', ago: 's lalu', noSignal: 'Belum dipasang',
    }
  : {
      app: 'Desalink Terminal', title: ['Serian', 'Overview'], district: 'Serian district', zones: 'zones', villages: 'villages',
      without: 'without coverage', homes: 'Households', coverage: 'Coverage', zoneList: 'Zones', villageList: 'Villages', perVillage: 'Homes per village',
      all: 'All', none: 'No coverage', scheduled: 'Scheduled', connected: 'Connected', road: 'To road', speed: 'Speed',
      add: 'Add to rollout plan', inPlan: 'In rollout plan', remove: 'Remove', onSite: 'Technicians on site within 24–48 hours', plan: 'Rollout plan',
      planHomes: 'homes', send: 'Send request', sent: 'Request sent', done: 'Done', close: 'Close',
      hint: 'Click a zone to begin', reset: 'Whole district', live: 'Live', throughput: 'Throughput', online: 'Online', latency: 'Latency',
      speed24: 'Speed, 24 h', uptime30: 'Uptime, 30 days', site: 'Site', lastPing: 'Last ping', ago: 's ago', noSignal: 'Not installed',
    }

type Filter = 'all' | 'none' | 'scheduled'
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
const seed = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296
}

// One shared highlight that glides to the row under the pointer (fluid hover)
function List({ children, label }: { children: ReactNode; label: string }) {
  const [hl, setHl] = useState({ y: 0, h: 0, on: false })
  const move = (e: React.PointerEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-row]')
    if (row) setHl({ y: row.offsetTop, h: row.offsetHeight, on: true })
  }
  return (
    <div className="tm-list" role="list" aria-label={label} onPointerMove={move} onPointerLeave={() => setHl((h) => ({ ...h, on: false }))}>
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

// A small live line chart
function Spark({ data, max }: { data: number[]; max: number }) {
  const w = 280, h = 64
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - (v / max) * (h - 10)] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
  const last = pts[pts.length - 1]!
  return (
    <svg className="tm-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="tm-spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9fc2ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#9fc2ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d}L${w} ${h}L0 ${h}Z`} fill="url(#tm-spark-fill)" />
      <path d={d} className="tm-spark__line" />
      <circle cx={last[0]} cy={last[1]} r="3.5" className="tm-spark__dot" />
    </svg>
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
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [tick, setTick] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const lastTip = useRef(hover)
  if (hover) lastTip.current = hover
  const stage = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const sendBtn = useRef<HTMLButtonElement>(null)
  const villageScroll = useRef<HTMLDivElement>(null)

  const statusOf = useCallback((v: Village): Status => (scheduled.includes(v.id) ? 'scheduled' : v.status), [scheduled])
  const zone = ZONES.find((z) => z.id === zoneId) ?? null
  const village = VILLAGES.find((v) => v.id === villageId) ?? null

  // Live clock and telemetry
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = setInterval(() => {
      setNow(new Date())
      if (!reduced) setTick((t) => t + 1)
    }, 2000)
    return () => clearInterval(id)
  }, [])
  const online = VILLAGES.filter((v) => statusOf(v) === 'connected').length
  const rnd = useMemo(() => seed(`t${tick}`), [tick])
  const throughput = 14.2 + Math.sin(tick / 3) * 1.1 + rnd() * 0.6
  const latency = Math.round(36 + Math.sin(tick / 4) * 3 + rnd() * 3)

  // Stage size, for the camera
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e!.contentRect.width, h: e!.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    villageScroll.current?.scrollTo({ top: 0 })
  }, [villageId])

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

  // Camera, in stage pixels: fit the district (or the zone) into the space
  // the trays leave free
  const narrow = size.w < 760
  const planOpen = plan.length > 0 && !narrow
  const camera = useMemo(() => {
    const pad = narrow ? 16 : 40
    const left = narrow ? pad : 400
    const right = size.w - (planOpen ? 340 : 0) - pad
    const top = narrow ? 120 : 110
    const bottom = narrow ? size.h * 0.46 - pad : size.h - pad
    const [x0, y0, x1, y1] = zone ? zone.box : [60, 50, 935, 795]
    const s = Math.min((right - left) / (x1 - x0), (bottom - top) / (y1 - y0)) * (zone ? 0.88 : zoom)
    return { s, tx: (left + right) / 2 - ((x0 + x1) / 2) * s, ty: (top + bottom) / 2 - ((y0 + y1) / 2) * s }
  }, [zone, zoom, size, planOpen, narrow])

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
      c({ particleCount: 90, spread: 70, startVelocity: 38, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: ['#ff5a1f', '#f5c518', '#ffffff', '#9fc2ff'], zIndex: 10001 })
    }
  }
  const finish = () => {
    setPlan([])
    setSent(false)
  }
  const tip = (label: string, sub: string) => (e: React.PointerEvent) => setHover({ label, sub, x: e.clientX, y: e.clientY })

  // Live series for the open village
  const series = useMemo(() => {
    if (!village || statusOf(village) !== 'connected') return null
    const r = seed(village.id)
    const base = village.mbps ?? 180
    const speed = Array.from({ length: 48 }, (_, i) => Math.max(40, base * (0.78 + 0.22 * Math.sin((i + tick) / 5) + r() * 0.12)))
    const uptime = Array.from({ length: 30 }, () => (r() < 0.06 ? 'dip' : 'ok'))
    return { speed, uptime, now: Math.round(speed[speed.length - 1]!) }
  }, [village, tick, statusOf])

  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

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
          <div className="tm-stage" ref={stage}>
            {/* The map, in stage pixels with the camera on the map group */}
            <svg className="tm-map" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
              <defs>
                <radialGradient id="tm-fade-g" cx="0.5" cy="0.5" r="0.62">
                  <stop offset="0.72" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </radialGradient>
                <mask id="tm-fade" maskContentUnits="objectBoundingBox">
                  <rect width="1" height="1" fill="url(#tm-fade-g)" />
                </mask>
                <radialGradient id="tm-vignette" cx="58%" cy="52%" r="72%">
                  <stop offset="0.5" stopColor="#07080a" stopOpacity="0" />
                  <stop offset="1" stopColor="#07080a" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <g className="tm-cam" style={{ transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.s})` }}>
                <image href="/images/terminal-terrain.jpg" x={0} y={0} width={VIEW.w} height={VIEW.h} preserveAspectRatio="none" mask="url(#tm-fade)" onClick={() => pickZone(null)} />
                <path d={`M-3000 -3000H4000V4000H-3000Z${DISTRICT}`} fillRule="evenodd" className="tm-outside" onClick={() => pickZone(null)} />
                {ZONES.map((z) => (
                  <path
                    key={z.id}
                    d={z.path}
                    className="tm-zone"
                    data-on={z.id === zoneId || undefined}
                    data-dim={(zoneId && z.id !== zoneId) || undefined}
                    tabIndex={0}
                    role="button"
                    aria-label={`${z.name}, ${zoneCoverage(z.id)}% ${T.coverage.toLowerCase()}`}
                    onClick={() => pickZone(z.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickZone(z.id))}
                    onPointerMove={tip(z.name, `${zoneCoverage(z.id)}% ${T.coverage.toLowerCase()} · ${VILLAGES.filter((v) => v.zone === z.id).length} ${T.villages}`)}
                    onPointerLeave={() => setHover(null)}
                  />
                ))}
                {RIVERS.map((r, i) => (
                  <path key={i} d={r.d} className="tm-river" data-main={r.main || undefined} />
                ))}
                {ROADS_MINOR.map((d, i) => (
                  <path key={i} d={d} className="tm-road tm-road--minor" />
                ))}
                {ROADS_MAJOR.map((d, i) => (
                  <path key={i} d={d} className="tm-road" />
                ))}
                <path d={DISTRICT} className="tm-district" />
                {ZONES.map((z) => (
                  <text key={z.id} className="tm-zlabel" data-hide={zone ? '' : undefined} style={{ transform: `translate(${z.cx}px, ${z.cy}px) scale(${1 / camera.s})` }}>
                    {z.name.toUpperCase()}
                  </text>
                ))}
                {VILLAGES.map((v, i) => {
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
                      style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${1 / camera.s})`, ['--i' as string]: i % 23 }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${v.name}, ${statusText(st)}`}
                      onClick={(e) => (e.stopPropagation(), pickVillage(v))}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickVillage(v))}
                      onPointerMove={(e) => (e.stopPropagation(), tip(v.name, `${v.homes} ${T.planHomes} · ${statusText(st)}`)(e))}
                      onPointerLeave={() => setHover(null)}
                    >
                      <circle className="tm-pin__hit" r={10} />
                      {st === 'connected' && <circle className="tm-pin__pulse" r={4} />}
                      <circle className="tm-pin__glow" r={8} />
                      <circle className="tm-pin__dot" r={st === 'connected' ? 2.6 : 4} />
                    </g>
                  )
                })}
                <g className="tm-town" style={{ transform: `translate(${TOWN.x}px, ${TOWN.y}px) scale(${1 / camera.s})` }}>
                  <rect x={-5} y={-5} width={10} height={10} rx={2} />
                  <text x={11} y={4}>{TOWN.name}</text>
                </g>
              </g>
              <rect width={size.w} height={size.h} fill="url(#tm-vignette)" pointerEvents="none" />
            </svg>

            {/* Satellite passes, sweeping slowly across the view */}
            <svg className="tm-sats" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden>
              {[
                { d: 'M-40 520 C 300 360, 640 200, 1040 40', dur: 26 },
                { d: 'M-40 120 C 320 220, 700 360, 1040 600', dur: 34 },
                { d: 'M200 -40 C 380 220, 560 420, 760 640', dur: 42 },
              ].map((t, i) => (
                <g key={i}>
                  <path d={t.d} id={`tm-orbit-${i}`} className="tm-orbit" />
                  <circle r="2.5" className="tm-sat">
                    <animateMotion dur={`${t.dur}s`} begin={`${-i * 9}s`} repeatCount="indefinite">
                      <mpath href={`#tm-orbit-${i}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}
            </svg>

            <div className="tm-title" aria-hidden>
              {T.title[0]}
              <br />
              {T.title[1]}
            </div>

            <header className="tm-top">
              <nav className="tm-crumb" aria-label="Breadcrumb">
                <button type="button" onClick={() => pickZone(null)} data-on={!zone || undefined}>{T.district}</button>
                <span className="tm-crumb__zone" data-on={zone ? '' : undefined}>
                  <ChevronRight size={14} aria-hidden />
                  <span>{zone?.name ?? ''}</span>
                </span>
              </nav>
              <div className="tm-live" aria-live="off">
                <span className="tm-live__badge"><i />{T.live}</span>
                <span className="tm-live__item"><small>{T.throughput}</small><b><Count value={throughput} format={(n) => n.toFixed(1)} duration={500} /></b><em>Gbps</em></span>
                <span className="tm-live__item"><small>{T.online}</small><b><Count value={online} /></b><em>/ {VILLAGES.length}</em></span>
                <span className="tm-live__item"><small>{T.latency}</small><b><Count value={latency} duration={500} /></b><em>ms</em></span>
                <span className="tm-live__clock">{clock}</span>
              </div>
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

            <div className="tm-zoom" role="group" aria-label="Zoom">
              <button type="button" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(1)))} aria-label="Zoom in" disabled={!!zone}><Plus size={16} /></button>
              <button type="button" onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))} aria-label="Zoom out" disabled={!!zone}><Minus size={16} /></button>
              <button type="button" onClick={() => (pickZone(null), setZoom(1))} aria-label={T.reset}><Maximize size={15} /></button>
            </div>
            <div className="tm-hint" data-on={!zone || undefined} aria-hidden>{T.hint}</div>
            <div className="tm-credit">© OpenStreetMap contributors · SRTM</div>

            {/* Trays: the area panel, with a village tray stacked over it */}
            <aside className="tm-trays" data-depth={village ? 2 : 1}>
              <section className="tm-tray tm-tray--area" aria-label={zone?.name ?? T.district}>
                <div className="tm-tray__in">
                  <div className="tm-tray__swap" key={zoneId ?? 'district'}>
                    <div className="tm-tray__kicker">{zone ? T.district : 'Sarawak'}</div>
                    <div className="tm-tray__name">{zone?.name ?? T.district}</div>
                    <div className="tm-chips">
                      <span className="tm-chip">{zone ? `${stats.vs.length} ${T.villages}` : `${ZONES.length} ${T.zones} · ${VILLAGES.length} ${T.villages}`}</span>
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
                          <i key={v.id} data-status={statusOf(v)} style={{ transform: `scaleY(${v.homes / 160})` }} />
                        ))}
                      </div>
                      <div className="tm-label">{T.villageList}</div>
                      <List label={T.villageList}>
                        {[...stats.vs].sort((a, b) => (a.status === b.status ? 0 : a.status === 'none' ? -1 : 1)).map((v) => {
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
                            <button key={z.id} type="button" role="listitem" data-row className="tm-row" onClick={() => pickZone(z.id)}>
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
                    const bx = (village.x / VIEW.w) * 100, by = (village.y / VIEW.h) * 100
                    return (
                      <div className="tm-tray__swap" key={village.id}>
                        <button type="button" className="tm-back" onClick={() => setVillageId(null)}>
                          <ChevronLeft size={16} />
                          {ZONES.find((z) => z.id === village.zone)?.name}
                        </button>
                        <div className="tm-tray__name">{village.name}</div>
                        <div className="tm-site" style={{ backgroundPosition: `${bx}% ${by}%` }}>
                          <span className="tm-site__ring" data-status={st} />
                          <span className="tm-site__label">{T.site} · {(1.4 - (village.y / VIEW.h) * 0.57).toFixed(3)}°N {(110.36 + (village.x / VIEW.w) * 0.68).toFixed(3)}°E</span>
                          <span className="tm-site__status" data-status={st}>
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
                            <span className="tm-stat__value">{series ? <Count value={series.now} duration={500} /> : '—'}{series && <small>Mbps</small>}</span>
                          </div>
                        </div>
                        {series ? (
                          <>
                            <div className="tm-label tm-label--row"><span>{T.speed24}</span><span className="tm-ping"><i />{T.lastPing} {1 + (tick % 3)}{T.ago}</span></div>
                            <Spark data={series.speed} max={260} />
                            <div className="tm-label">{T.uptime30}</div>
                            <div className="tm-uptime" aria-hidden>
                              {series.uptime.map((u, i) => <i key={i} data-dip={u === 'dip' || undefined} />)}
                            </div>
                          </>
                        ) : st === 'none' ? (
                          <>
                            <div className="tm-empty">{T.noSignal}</div>
                            <button type="button" className="tm-action" data-on={inPlan || undefined} onClick={() => togglePlan(village.id)}>
                              <span className="tm-action__icon">
                                <Plus size={16} data-on={!inPlan || undefined} />
                                <Check size={16} strokeWidth={2.5} data-on={inPlan || undefined} />
                              </span>
                              <Roll variant="fade">{inPlan ? T.inPlan : T.add}</Roll>
                            </button>
                          </>
                        ) : (
                          <div className="tm-note"><Check size={15} /> {T.onSite}</div>
                        )}
                        {series && <div className="tm-note"><Wifi size={15} /> {T.connected} · {village.mbps} Mbps</div>}
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
              <div className="tm-plan__big"><Count value={planHomes} format={fmt} duration={600} /></div>
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

/* ============================================================
   DESALINK script.js
   ============================================================ */

document.documentElement.classList.add('js');

// ---------- NAV SCROLL EFFECT ----------
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ---------- MOBILE MENU ----------
(function () {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('.mobile-menu__link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
})();

// ---------- SCROLL REVEAL ----------
(function () {
  const targets = document.querySelectorAll(
    '.panel__overlay, .steps__card, .order__plan, .support__card'
  );

  const style = document.createElement('style');
  style.textContent = `
    .panel__overlay, .steps__card, .order__plan, .support__card {
      opacity: 0;
      translate: 0 24px;
      transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), translate 0.9s cubic-bezier(0.4,0,0.2,1);
    }
    .revealed { opacity: 1 !important; translate: 0 0 !important; }
    .steps__card:nth-child(2) { transition-delay: 0.12s; }
    .steps__card:nth-child(3) { transition-delay: 0.24s; }
    .order__plan:nth-child(2) { transition-delay: 0.1s; }
    .order__plan:nth-child(3) { transition-delay: 0.2s; }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
})();

// ---------- AVAILABILITY CHECK (STUB) ----------
(function () {
  document.querySelectorAll('.order__form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      alert(`Thanks! We'll check availability for "${val}" and get back to you via WhatsApp or email within 24 hours.`);
      input.value = '';
    });
  });
})();

// ---------- SITE DATA (shared by the map and the terminal demo) ----------
const SITES = [
  { code: 'v4_001', site: 'Kampung Riih Daso', location: 'bukit semuja', district: 'serian', status: 'connected', start: '6/6/2026', end: '6/6/2027', plan: 'business local priority 500gb' },
  { code: 'v4_002', site: 'Kampung Rasau', location: 'bukit semuja', district: 'serian', status: 'connected', start: '1/7/2026', end: '1/7/2027', plan: 'business local priority 500gb' },
  { code: 'v4_003', site: 'Kampung Merakai', location: 'bukit semuja', district: 'serian', status: 'connected', start: '15/8/2026', end: '15/8/2027', plan: 'business local priority 500gb' },
  { code: 'v4_004', site: 'Kampung Tebakang', location: 'bukit semuja', district: 'serian', status: 'pending', start: '1/10/2026', end: '1/10/2027', plan: 'business local priority 500gb' },
  { code: 'v4_005', site: 'Kampung Sungai Buloh', location: 'bukit semuja', district: 'serian', status: 'pending', start: '1/11/2026', end: '1/11/2027', plan: 'business local priority 500gb' },
  { code: 'v4_006', site: 'Kampung Sadir', location: 'padawan', district: 'kuching', status: 'connected', start: '1/3/2026', end: '1/3/2027', plan: 'business local priority 500gb' },
  { code: 'v4_007', site: 'Rumah Panjang Bratak', location: 'bau', district: 'kuching', status: 'connected', start: '10/4/2026', end: '10/4/2027', plan: 'business local priority 1tb' },
  { code: 'v4_008', site: 'Kampung Stungkor', location: 'lundu', district: 'kuching', status: 'connected', start: '20/5/2026', end: '20/5/2027', plan: 'business local priority 500gb' },
  { code: 'v4_009', site: 'Kampung Pueh', location: 'sematan', district: 'kuching', status: 'pending', start: '1/9/2026', end: '1/9/2027', plan: 'business local priority 500gb' },
  { code: 'v4_010', site: 'Rumah Panjang Nanga Merit', location: 'lubok antu', district: 'sri aman', status: 'connected', start: '1/2/2026', end: '1/2/2027', plan: 'business local priority 500gb' },
  { code: 'v4_011', site: 'Kampung Paku', location: 'betong', district: 'sri aman', status: 'connected', start: '15/3/2026', end: '15/3/2027', plan: 'business local priority 500gb' },
  { code: 'v4_012', site: 'Long Banyok', location: 'spaoh', district: 'sri aman', status: 'pending', start: '15/10/2026', end: '15/10/2027', plan: 'business local priority 500gb' },
  { code: 'v4_013', site: 'Kampung Aceh', location: 'asajaya', district: 'samarahan', status: 'connected', start: '10/1/2026', end: '10/1/2027', plan: 'business local priority 500gb' },
  { code: 'v4_014', site: 'Kampung Siburan', location: 'kota samarahan', district: 'samarahan', status: 'connected', start: '1/4/2026', end: '1/4/2027', plan: 'business local priority 1tb' },
  { code: 'v4_015', site: 'Rumah Panjang Rimbas', location: 'simunjan', district: 'samarahan', status: 'pending', start: '15/11/2026', end: '15/11/2027', plan: 'business local priority 500gb' },
  { code: 'v4_016', site: 'Long Busai', location: 'kanowit', district: 'sibu', status: 'connected', start: '20/2/2026', end: '20/2/2027', plan: 'business local priority 500gb' },
  { code: 'v4_017', site: 'Kampung Ngemah', location: 'selangau', district: 'sibu', status: 'connected', start: '1/5/2026', end: '1/5/2027', plan: 'business local priority 500gb' },
  { code: 'v4_018', site: 'Kampung Oya', location: 'dalat', district: 'sibu', status: 'inactive', start: '1/12/2025', end: '1/12/2026', plan: 'standard residential' },
  { code: 'v4_019', site: 'Rumah Panjang Nanga Julau', location: 'julau', district: 'sarikei', status: 'connected', start: '5/3/2026', end: '5/3/2027', plan: 'business local priority 500gb' },
  { code: 'v4_020', site: 'Kampung Balingian', location: 'meradong', district: 'sarikei', status: 'pending', start: '1/12/2026', end: '1/12/2027', plan: 'business local priority 500gb' },
  { code: 'v4_021', site: 'Long Busang', location: 'kapit', district: 'kapit', status: 'connected', start: '20/1/2026', end: '20/1/2027', plan: 'business local priority 1tb' },
  { code: 'v4_022', site: 'Long Bedian', location: 'belaga', district: 'kapit', status: 'connected', start: '25/4/2026', end: '25/4/2027', plan: 'business local priority 500gb' },
  { code: 'v4_023', site: 'Kampung Nanga Mujong', location: 'song', district: 'kapit', status: 'inactive', start: '1/11/2025', end: '1/11/2026', plan: 'standard residential' },
  { code: 'v4_024', site: 'Long Lama', location: 'marudi', district: 'miri', status: 'connected', start: '10/2/2026', end: '10/2/2027', plan: 'business local priority 500gb' },
  { code: 'v4_025', site: 'Kampung Niah', location: 'niah', district: 'miri', status: 'connected', start: '5/5/2026', end: '5/5/2027', plan: 'business local priority 1tb' },
  { code: 'v4_026', site: 'Rumah Panjang Batu Niah', location: 'subis', district: 'miri', status: 'pending', start: '15/9/2026', end: '15/9/2027', plan: 'business local priority 500gb' },
  { code: 'v4_027', site: 'Long Tatau', location: 'tatau', district: 'bintulu', status: 'connected', start: '20/3/2026', end: '20/3/2027', plan: 'business local priority 500gb' },
  { code: 'v4_028', site: 'Kampung Sebauh Hilir', location: 'sebauh', district: 'bintulu', status: 'pending', start: '10/10/2026', end: '10/10/2027', plan: 'business local priority 500gb' },
  { code: 'v4_029', site: 'Kampung Medamit', location: 'limbang', district: 'limbang', status: 'connected', start: '5/1/2026', end: '5/1/2027', plan: 'business local priority 500gb' },
  { code: 'v4_030', site: 'Long Semadoh', location: 'lawas', district: 'limbang', status: 'pending', start: '15/12/2026', end: '15/12/2027', plan: 'business local priority 500gb' },
];

// ---------- SITE MAP RENDERER (shared) ----------
const SiteMap = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const VB_W = 630, VB_H = 430;
  const LON0 = 109.5, LAT0 = 5.15, K = 100; // 1 degree = 100 viewBox units

  // Simplified Sarawak outline [lon, lat]: coast from Tanjung Datu to Lawas,
  // then south along the Sabah and Kalimantan borders.
  const OUTLINE = [
    [109.64, 2.08], [109.78, 1.82], [109.9, 1.72], [110.2, 1.74], [110.35, 1.72],
    [110.6, 1.72], [110.9, 1.62], [111.12, 1.6], [111.35, 1.78], [111.55, 2.0],
    [111.8, 2.25], [111.95, 2.55], [112.1, 2.9], [112.5, 3.0], [113.0, 3.18],
    [113.35, 3.55], [113.7, 3.95], [114.0, 4.4], [114.1, 4.6], [114.3, 4.45],
    [114.55, 4.28], [114.8, 4.45], [114.95, 4.8], [115.05, 4.95], [115.2, 4.6],
    [115.35, 4.9], [115.55, 5.02], [115.62, 4.8], [115.5, 4.45], [115.62, 4.15],
    [115.6, 3.8], [115.45, 3.35], [115.15, 2.85], [114.85, 2.25], [114.55, 1.8],
    [114.2, 1.45], [113.7, 1.25], [113.1, 1.3], [112.5, 1.5], [112.15, 1.15],
    [111.9, 0.95], [111.3, 0.98], [110.8, 0.88], [110.4, 0.98], [110.05, 1.3],
    [109.7, 1.55], [109.58, 1.85]
  ];

  // Approximate coordinates for each site's location.
  const COORDS = {
    'bukit semuja': [110.57, 1.13], padawan: [110.3, 1.32], bau: [110.15, 1.42],
    lundu: [109.86, 1.66], sematan: [109.8, 1.79], 'lubok antu': [111.83, 1.1],
    betong: [111.53, 1.41], spaoh: [111.45, 1.28], asajaya: [110.6, 1.56],
    'kota samarahan': [110.49, 1.45], simunjan: [110.76, 1.38], kanowit: [112.15, 2.1],
    selangau: [112.25, 2.42], dalat: [111.95, 2.73], julau: [111.92, 2.02],
    meradong: [111.62, 2.15], kapit: [112.93, 2.01], belaga: [113.78, 2.7],
    song: [112.55, 2.0], marudi: [114.3, 4.18], niah: [113.72, 3.87],
    subis: [113.85, 3.75], tatau: [112.86, 2.88], sebauh: [113.28, 3.08],
    limbang: [114.98, 4.7], lawas: [115.4, 4.82]
  };

  const project = ([lon, lat]) => [(lon - LON0) * K, (LAT0 - lat) * K];
  const poly = OUTLINE.map(project);

  function inside(x, y) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Draws the dotted land and one dot per site into svg; returns the site nodes.
  function render(svg, sites) {
    const land = el('g', { class: 'sitemap__land' }, svg);
    const STEP = 9;
    for (let y = STEP / 2; y < VB_H; y += STEP) {
      for (let x = STEP / 2; x < VB_W; x += STEP) {
        if (inside(x, y)) el('circle', { cx: x, cy: y, r: 2 }, land);
      }
    }

    // Sites sharing a location are fanned out so they don't overlap.
    const seen = {};
    const layer = el('g', {}, svg);
    return sites.map((site, i) => {
      const base = COORDS[site.location];
      if (!base) return null;
      const n = (seen[site.location] = (seen[site.location] || 0) + 1) - 1;
      const angle = n * 2.4;
      const [x, y] = project(base);
      const cx = x + (n ? Math.cos(angle) * 11 * Math.sqrt(n) : 0);
      const cy = y + (n ? Math.sin(angle) * 11 * Math.sqrt(n) : 0);
      const g = el('g', { class: 'site site--' + site.status, tabindex: '0', role: 'button', 'aria-label': site.site + ', ' + site.status }, layer);
      el('circle', { class: 'site__ring', cx, cy, r: 4, style: '--delay:' + ((i * 0.37) % 2.8).toFixed(2) + 's' }, g);
      el('circle', { class: 'site__dot', cx, cy, r: 4 }, g);
      el('circle', { class: 'site__hit', cx, cy, r: 12 }, g);
      return { site, g, cx, cy };
    }).filter(Boolean);
  }

  // Calls fn when a site dot is hovered, clicked, focused or activated by keyboard.
  function onPick(nodes, fn) {
    nodes.forEach((node) => {
      const pick = () => fn(node);
      node.g.addEventListener('click', pick);
      node.g.addEventListener('mouseenter', pick);
      node.g.addEventListener('focus', pick);
      node.g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
      });
    });
  }

  return { render, onPick, VB_W, VB_H };
})();

const STATUS_TEXT = {
  connected: '● Connected',
  pending: '◐ Pending install',
  inactive: '○ Inactive'
};

// ---------- SITE MAP (on the page) ----------
(function () {
  const svg = document.getElementById('sitemapSvg');
  const stage = document.getElementById('sitemapStage');
  const card = document.getElementById('sitemapCard');
  if (!svg || !stage || !card) return;

  const nodes = SiteMap.render(svg, SITES);
  const count = document.getElementById('sitemapCount');
  if (count) count.textContent = nodes.length;

  const nameEl = document.getElementById('cardName');
  const locEl = document.getElementById('cardLoc');
  const statusEl = document.getElementById('cardStatus');
  const planEl = document.getElementById('cardPlan');

  let active = null;
  function show(node) {
    if (active) active.g.classList.remove('is-active');
    active = node;
    node.g.classList.add('is-active');

    const { site, cx, cy } = node;
    const px = (cx / SiteMap.VB_W) * 100;
    const py = (cy / SiteMap.VB_H) * 100;
    card.style.setProperty('--tx', px < 28 ? '-12%' : px > 72 ? '-88%' : '-50%');
    card.style.setProperty('--ty', py < 38 ? '16px' : 'calc(-100% - 16px)');

    card.classList.add('is-swapping');
    setTimeout(() => {
      nameEl.textContent = site.site;
      locEl.textContent = site.location + ', ' + site.district;
      statusEl.textContent = STATUS_TEXT[site.status] || site.status;
      statusEl.className = 'sitemap__card-status mono is-' + site.status;
      planEl.textContent = site.plan;
      card.style.left = px + '%';
      card.style.top = py + '%';
      card.hidden = false;
      card.classList.remove('is-swapping');
    }, card.hidden ? 0 : 200);
  }

  // Auto-cycle through a spread of sites while the map is on screen.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const order = nodes.slice().sort((a, b) => (a.site.code > b.site.code ? 1 : -1));
  const tour = order.filter((_, i) => i % 3 === 0).concat(order.filter((_, i) => i % 3 === 1), order.filter((_, i) => i % 3 === 2));
  let idx = 0, timer = null, visible = false, hovering = false;

  function tick() { show(tour[idx]); idx = (idx + 1) % tour.length; }
  function start() { if (!timer && !reduced && visible && !hovering) timer = setInterval(tick, 3200); }
  function stop() { clearInterval(timer); timer = null; }

  SiteMap.onPick(nodes, (node) => { show(node); idx = (tour.indexOf(node) + 1) % tour.length; });
  stage.addEventListener('mouseenter', () => { hovering = true; stop(); });
  stage.addEventListener('mouseleave', () => { hovering = false; start(); });

  tick();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0.3 }).observe(stage);
  } else {
    visible = true;
    start();
  }
})();

// ---------- LIVE DEMO (Desalink Terminal dashboard) ----------
// Metrics are simulated: seeded per site so they're stable between opens,
// then nudged every tick so the dashboard feels live.
(function () {
  const openBtn = document.getElementById('demoOpen');
  const modal = document.getElementById('demoModal');
  const backdrop = document.getElementById('demoBackdrop');
  const closeBtn = document.getElementById('demoClose');
  const svg = document.getElementById('dashSvg');
  const list = document.getElementById('dashList');
  const filtersEl = document.getElementById('dashFilters');
  if (!openBtn || !modal || !backdrop || !closeBtn || !svg || !list || !filtersEl) return;

  const $ = (id) => document.getElementById(id);
  const det = {
    name: $('detName'), loc: $('detLoc'), status: $('detStatus'), uptime: $('detUptime'),
    latency: $('detLatency'), down: $('detDown'), used: $('detUsed'), bar: $('detBar'), plan: $('detPlan')
  };
  const summaryEl = $('dashSummary');
  const updatedEl = $('dashUpdated');
  const ctaEl = $('dashCta');

  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const metrics = {};
  SITES.forEach((s) => {
    const r = seeded(s.code);
    const limit = s.plan.includes('1tb') ? 1000 : s.plan.includes('500gb') ? 500 : null;
    const live = s.status === 'connected';
    metrics[s.code] = {
      live,
      uptime: live ? 99.2 + r() * 0.75 : null,
      latency: live ? 24 + r() * 16 : null,
      down: live ? 110 + r() * 170 : null,
      used: live && limit ? limit * (0.18 + r() * 0.6) : 0,
      limit
    };
  });

  let built = false, nodes = [], rows = {}, selected = null, filter = 'all', timer = null, lastFocus = null;

  function fmtLatency(m) { return m.live ? Math.round(m.latency) + ' ms' : '—'; }
  function fmtUptime(m) { return m.live ? m.uptime.toFixed(1) + '%' : '—'; }

  function build() {
    built = true;
    nodes = SiteMap.render(svg, SITES);

    nodes.forEach((node) => {
      const s = node.site, m = metrics[s.code];
      const li = document.createElement('li');
      li.dataset.status = s.status;
      li.innerHTML =
        '<button type="button" class="dash__row">' +
          '<span class="dash__row-name"><i class="dot dot--' + s.status + '"></i>' +
            '<span>' + s.site + '<small>' + s.location + ', ' + s.district + '</small></span></span>' +
          '<span class="mono" data-k="latency">' + fmtLatency(m) + '</span>' +
          '<span class="mono" data-k="uptime">' + fmtUptime(m) + '</span>' +
        '</button>';
      const btn = li.firstChild;
      btn.addEventListener('click', () => select(node, false));
      list.appendChild(li);
      rows[s.code] = { li, btn, latency: btn.querySelector('[data-k="latency"]'), uptime: btn.querySelector('[data-k="uptime"]') };
    });

    SiteMap.onPick(nodes, (node) => select(node, true));

    const counts = { all: nodes.length, connected: 0, pending: 0, inactive: 0 };
    nodes.forEach((n) => counts[n.site.status]++);
    filtersEl.querySelectorAll('.dash__filter').forEach((b) => { b.querySelector('span').textContent = counts[b.dataset.filter]; });
    summaryEl.textContent = counts.connected + ' connected · ' + counts.pending + ' pending · ' + counts.inactive + ' inactive';

    filtersEl.addEventListener('click', (e) => {
      const b = e.target.closest('.dash__filter');
      if (b) applyFilter(b.dataset.filter);
    });
  }

  function select(node, fromMap) {
    if (selected) {
      selected.g.classList.remove('is-active');
      rows[selected.site.code].btn.classList.remove('is-active');
    }
    selected = node;
    node.g.classList.add('is-active');
    const row = rows[node.site.code];
    row.btn.classList.add('is-active');
    if (fromMap) row.li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    renderDetail();
  }

  function renderDetail() {
    if (!selected) return;
    const s = selected.site, m = metrics[s.code];
    det.name.textContent = s.site;
    det.loc.textContent = s.location + ', ' + s.district;
    det.status.textContent = STATUS_TEXT[s.status] || s.status;
    det.status.className = 'mono dash__detail-status is-' + s.status;
    det.uptime.textContent = fmtUptime(m);
    det.latency.textContent = fmtLatency(m);
    det.down.textContent = m.live ? Math.round(m.down) + ' Mbps' : '—';
    if (!m.live) {
      det.used.textContent = '—';
      det.bar.style.width = '0';
    } else if (m.limit) {
      det.used.textContent = m.used.toFixed(1) + ' / ' + m.limit + ' GB';
      det.bar.style.width = ((m.used / m.limit) * 100).toFixed(1) + '%';
    } else {
      det.used.textContent = m.used.toFixed(1) + ' GB';
      det.bar.style.width = '0';
    }
    det.plan.textContent = s.plan + ' · ' + s.start + ' – ' + s.end;
  }

  function applyFilter(f) {
    filter = f;
    filtersEl.querySelectorAll('.dash__filter').forEach((b) => b.classList.toggle('is-on', b.dataset.filter === f));
    let first = null;
    nodes.forEach((node) => {
      const show = f === 'all' || node.site.status === f;
      node.g.classList.toggle('is-dim', !show);
      rows[node.site.code].li.hidden = !show;
      if (show && !first) first = node;
    });
    if (first && (!selected || (f !== 'all' && selected.site.status !== f))) select(first, false);
  }

  function tick() {
    nodes.forEach(({ site }) => {
      const m = metrics[site.code];
      if (!m.live) return;
      m.latency = clamp(m.latency + (Math.random() - 0.5) * 5, 20, 60);
      m.down = clamp(m.down + (Math.random() - 0.5) * 24, 80, 320);
      m.uptime = clamp(m.uptime + (Math.random() - 0.48) * 0.02, 98.9, 99.99);
      m.used += Math.random() * 0.08;
      if (m.limit) m.used = Math.min(m.used, m.limit);

      const row = rows[site.code];
      const lat = fmtLatency(m), up = fmtUptime(m);
      if (row.latency.textContent !== lat) flash(row.latency, lat);
      if (row.uptime.textContent !== up) flash(row.uptime, up);
    });
    renderDetail();
    updatedEl.textContent = 'Updated ' + new Date().toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' MYT';
  }

  function flash(elm, text) {
    elm.textContent = text;
    elm.classList.add('is-tick');
    setTimeout(() => elm.classList.remove('is-tick'), 400);
  }

  function openModal() {
    lastFocus = document.activeElement;
    if (!built) build();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    applyFilter(filter);
    tick();
    timer = setInterval(tick, 1500);
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    clearInterval(timer);
    timer = null;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  if (ctaEl) ctaEl.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });
})();

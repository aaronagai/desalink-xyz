/* ============================================================
   DESALINK script.js
   ============================================================ */

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

// ---------- DEMO MODAL (TERMINAL STATUS) ----------
(function () {
  const openBtn = document.getElementById('demoOpen');
  const modal = document.getElementById('demoModal');
  const backdrop = document.getElementById('demoBackdrop');
  const closeBtn = document.getElementById('demoClose');
  const screen = document.getElementById('terminalScreen');
  if (!openBtn || !modal || !backdrop || !closeBtn || !screen) return;

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

  let lastFocus = null;
  let rendered = false;

  function statusClass(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'connected') return 'status--connected';
    if (s === 'pending') return 'status--pending';
    if (s === 'inactive') return 'status--inactive';
    return '';
  }

  function renderTerminal() {
    if (rendered) return;
    rendered = true;

    const prompt = document.createElement('div');
    prompt.className = 'terminal__prompt';
    prompt.textContent = 'Live view of registered terminals. Scroll to see all sites.';

    const wrap = document.createElement('div');
    wrap.className = 'terminal__table-wrap';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Code</th>
          <th scope="col">Site</th>
          <th scope="col">Location</th>
          <th scope="col">District</th>
          <th scope="col">Status</th>
          <th scope="col">Start</th>
          <th scope="col">End</th>
          <th scope="col">Plan</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    SITES.forEach((row) => {
      const tr = document.createElement('tr');
      const stClass = statusClass(row.status);
      tr.innerHTML = `
        <td>${row.code}</td>
        <td>${row.site}</td>
        <td>${row.location}</td>
        <td>${row.district}</td>
        <td class="terminal__status ${stClass}"><span class="terminal__status-dot" aria-hidden="true"></span><span class="terminal__status-text">${row.status}</span></td>
        <td>${row.start}</td>
        <td>${row.end}</td>
        <td>${row.plan}</td>
      `;
      tbody.appendChild(tr);
    });

    wrap.appendChild(table);
    screen.appendChild(prompt);
    screen.appendChild(wrap);
  }

  function openModal() {
    lastFocus = document.activeElement;
    renderTerminal();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });
})();

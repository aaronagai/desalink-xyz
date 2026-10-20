#!/usr/bin/env python3
"""Generates the SEO pages for desalink.xyz.

  python3 scripts/build_pages.py

- Rewrites the shared blocks in index.html (structured data, areas, FAQ, footer).
- Writes ms/index.html, the Bahasa Malaysia homepage, by translating index.html.
- Writes one page per town and guide from scripts/content.py.
- Writes sitemap.xml.

Edit copy in content.py (or MS below), then re-run and commit the output.
"""
import html
import json
import re
from datetime import date
from pathlib import Path

from content import AREAS_BLURB, FAQ, GUIDES, TOWNS

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://desalink.xyz"
TODAY = date.today().isoformat()
CSS_V = 26
JS_V = 20

BUSINESS = {
    "@type": "LocalBusiness",
    "@id": f"{SITE}/#business",
    "name": "Desalink",
    "legalName": "Desa Link Technologies Sdn. Bhd.",
    "description": "Authorised Starlink installer providing satellite internet supply, installation and support across Sarawak, Malaysia.",
    "url": f"{SITE}/",
    "logo": f"{SITE}/icon-512.png",
    "image": f"{SITE}/images/og-image.jpg",
    "telephone": "+60128871906",
    "email": "hello@desalink.xyz",
    "address": {"@type": "PostalAddress", "streetAddress": "Level 23, Menara Exchange 106, Lingkaran TRX, Tun Razak Exchange",
                "addressLocality": "Kuala Lumpur", "postalCode": "55188", "addressCountry": "MY"},
    "areaServed": [{"@type": "State", "name": "Sarawak"}, {"@type": "Country", "name": "Malaysia"}],
    "knowsAbout": ["Starlink", "Satellite internet", "Rural broadband"],
    "contactPoint": {"@type": "ContactPoint", "telephone": "+60128871906", "contactType": "customer service",
                     "areaServed": "MY", "availableLanguage": ["English", "Malay"]},
    "makesOffer": {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Starlink installation",
                   "serviceType": "Satellite internet installation", "areaServed": {"@type": "State", "name": "Sarawak"}}},
}

# ---------------------------------------------------------------- helpers

def text(s):
    """Inline HTML -> plain text, for structured data."""
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def ld_script(graph):
    body = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    return f'<script type="application/ld+json">\n{body}\n  </script>'


def faq_ld(items, page_url):
    return {"@type": "FAQPage", "@id": f"{page_url}#faq",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": text(a)}}
                           for q, a in items]}


def replace_once(s, pattern, new, flags=re.S):
    out, n = re.subn(pattern, lambda _: new, s, count=1, flags=flags)
    assert n == 1, f"pattern not found: {pattern[:60]}"
    return out

# ---------------------------------------------------------------- shared blocks

def faq_section(items, lang="en", heading=None, meta=None):
    t = {
        "en": ("Starlink in Malaysia", "Questions, answered", "Can't find what you need?", "Message us on WhatsApp"),
        "ms": ("Starlink di Malaysia", "Soalan lazim", "Tidak jumpa jawapan anda?", "Hantar mesej di WhatsApp"),
    }[lang]
    rows = "\n".join(f'''        <details class="faq__item">
          <summary class="faq__q">{html.escape(q)}<span class="faq__icon" aria-hidden="true"></span></summary>
          <div class="faq__a"><p>{a}</p></div>
        </details>''' for q, a in items)
    label = "FAQ" if lang == "en" else "Soalan lazim"
    return f'''<!-- ====== FAQ ====== -->
    <section class="section faq" id="faq">
      <div class="faq__head">
        <span class="meta">{meta or t[0]} <i></i> {label}</span>
        <h2 class="h2">{heading or t[1]}</h2>
        <p class="muted">{t[2]} <a href="https://wa.me/60128871906" target="_blank" rel="noopener" class="textlink">{t[3]}</a></p>
      </div>
      <div class="faq__list">
{rows}
      </div>
    </section>'''


def areas_section(lang="en"):
    head, sub, link = {
        "en": ("Starlink installation across Sarawak", "Starlink in", "What it costs"),
        "ms": ("Pemasangan Starlink di seluruh Sarawak", "Starlink di", "Harga Starlink"),
    }[lang]
    tiles = "\n".join(f'''        <a class="tile reveal" href="/{t["slug"]}"{' hreflang="en"' if lang == "ms" else ""}>
          <div class="tile__box tile__box--short"><span class="tile__num tile__num--sm">{t["name"]}</span></div>
          <h3>{sub} {t["name"]}</h3>
          <span class="meta">{AREAS_BLURB[t["slug"]][0 if lang == "en" else 1]}</span>
        </a>''' for t in TOWNS)
    return f'''<!-- ====== AREAS ====== -->
    <section class="section" id="areas">
      <div class="section__head">
        <h2 class="h2">{head}</h2>
        <a href="/starlink-price-malaysia" class="textlink">{link}</a>
      </div>
      <div class="tiles tiles--3">
{tiles}
      </div>
    </section>'''


def footer(lang="en"):
    L = {
        "en": dict(service="Service", reliability="Reliability", terminal="Desalink Terminal", deploy="Deployment",
                   check="Check availability", areas="Areas", guides="Guides", support="Support", contact="Contact",
                   faq="FAQ", lang_link='<a href="/ms" hreflang="ms" lang="ms">Bahasa Malaysia</a>', entities="Entities",
                   privacy="Privacy Policy", tm="Starlink&reg; is a registered trademark of Space Exploration Technologies Corp.",
                   g=["Starlink price in Malaysia", "Starlink for longhouses", "Starlink for business"]),
        "ms": dict(service="Perkhidmatan", reliability="Kebolehpercayaan", terminal="Desalink Terminal", deploy="Pelaksanaan",
                   check="Semak liputan", areas="Kawasan", guides="Panduan (EN)", support="Sokongan", contact="Hubungi kami",
                   faq="Soalan lazim", lang_link='<a href="/" hreflang="en" lang="en">English</a>', entities="Entiti",
                   privacy="Dasar Privasi", tm="Starlink&reg; ialah tanda dagangan berdaftar Space Exploration Technologies Corp.",
                   g=["Harga Starlink di Malaysia", "Starlink untuk rumah panjang", "Starlink untuk perniagaan"]),
    }[lang]
    home = "/ms" if lang == "ms" else "/"
    towns = "\n".join(f'          <a href="/{t["slug"]}">{t["name"]}</a>' for t in TOWNS)
    guides = "\n".join(f'          <a href="/{g["slug"]}">{name}</a>' for g, name in zip(GUIDES, L["g"]))
    return f'''<footer class="footer">
    <div class="footer__inner">
      <div class="footer__cols">
        <div class="footer__col">
          <h4>{L["service"]}</h4>
          <a href="{home}#reliable">{L["reliability"]}</a>
          <a href="{home}#fleet">{L["terminal"]}</a>
          <a href="{home}#fast-deploy">{L["deploy"]}</a>
          <a href="{home}#order">{L["check"]}</a>
        </div>
        <div class="footer__col">
          <h4>{L["areas"]}</h4>
{towns}
        </div>
        <div class="footer__col">
          <h4>{L["guides"]}</h4>
{guides}
        </div>
        <div class="footer__col">
          <h4>{L["support"]}</h4>
          <a href="{home}#support">{L["contact"]}</a>
          <a href="{home}#faq">{L["faq"]}</a>
          <a href="https://wa.me/60128871906" target="_blank" rel="noopener">WhatsApp</a>
          {L["lang_link"]}
        </div>
        <div class="footer__col footer__col--entities">
          <h4>{L["entities"]}</h4>
          <p>Desa Link Technologies Sdn. Bhd.<br />202601017382 (1679479-V)</p>
          <p>Desa Link Technologies Enterprise<br />202603116585 (003847882-V)</p>
          <address>Level 23, Menara Exchange 106,<br />Lingkaran TRX, Tun Razak Exchange,<br />55188 Kuala Lumpur, Malaysia</address>
        </div>
      </div>
      <div class="footer__bottom">
        <span>&copy; 2026 Desa Link Technologies Sdn. Bhd.</span>
        <a href="#">{L["privacy"]}</a>
        <span class="footer__tm">{L["tm"]}</span>
      </div>
    </div>
    <div class="ph ph--footer" aria-hidden="true"><span>Image: footer landscape</span></div>
  </footer>'''


def home_ld(lang):
    url = f"{SITE}/" if lang == "en" else f"{SITE}/ms"
    return ld_script([
        BUSINESS,
        {"@type": "WebSite", "@id": f"{SITE}/#website", "url": f"{SITE}/", "name": "Desalink",
         "inLanguage": ["en-MY", "ms-MY"], "publisher": {"@id": f"{SITE}/#business"}},
        faq_ld(FAQ[lang], url),
    ])


def patch_home(s, lang):
    s = replace_once(s, r'<script type="application/ld\+json">.*?</script>', home_ld(lang))
    s = replace_once(s, r"<!-- ====== FAQ ====== -->.*?</section>", faq_section(FAQ[lang], lang))
    if "<!-- ====== AREAS ====== -->" in s:
        s = replace_once(s, r"<!-- ====== AREAS ====== -->.*?</section>", areas_section(lang))
    else:
        s = s.replace("    <!-- ====== FAQ ====== -->", "    " + areas_section(lang) + "\n\n    <!-- ====== FAQ ====== -->", 1)
    s = replace_once(s, r'<footer class="footer">.*?</footer>', footer(lang))
    s = re.sub(r"style\.css\?v=\d+", f"style.css?v={CSS_V}", s)
    return s

# ---------------------------------------------------------------- Bahasa Malaysia homepage

MS = [
    ('<html lang="en-MY">', '<html lang="ms-MY">'),
    ("<title>Starlink Installation in Sarawak, Malaysia | Desalink</title>", "<title>Pemasangan Starlink di Sarawak, Malaysia | Desalink</title>"),
    ('<link rel="canonical" href="https://desalink.xyz/" />', '<link rel="canonical" href="https://desalink.xyz/ms" />'),
    ('<meta property="og:url" content="https://desalink.xyz/" />', '<meta property="og:url" content="https://desalink.xyz/ms" />'),
    ('<meta property="og:locale" content="en_MY" />', '<meta property="og:locale" content="ms_MY" />'),
    ("Starlink Installation in Sarawak, Malaysia | Desalink", "Pemasangan Starlink di Sarawak, Malaysia | Desalink"),
    ("Authorised Starlink installer in Sarawak, Malaysia. We supply, install and support Starlink satellite internet for homes, longhouses and businesses, from Kuching to Miri.",
     "Pemasang Starlink yang sah di Sarawak, Malaysia. Kami membekal, memasang dan menyokong internet satelit Starlink untuk rumah, rumah panjang dan perniagaan, dari Kuching ke Miri."),
    ("Desalink: High-speed internet for rural Sarawak, over moonlit limestone pinnacles", "Desalink: Internet berkelajuan tinggi untuk luar bandar Sarawak"),
    # nav
    ('<a href="#reliable">Service</a>', '<a href="#reliable">Perkhidmatan</a>'),
    ('<a href="#how-it-works">How it works</a>', '<a href="#how-it-works">Cara ia berfungsi</a>'),
    ('<a href="#faq">FAQ</a>', '<a href="#faq">Soalan lazim</a>'),
    ('<a href="#support">Support</a>', '<a href="#support">Sokongan</a>'),
    ('<a href="/ms" hreflang="ms" lang="ms" class="nav__lang">BM</a>', '<a href="/" hreflang="en" lang="en" class="nav__lang">EN</a>'),
    ('class="btn btn--dark nav__cta">Check availability</a>', 'class="btn btn--dark nav__cta">Semak liputan</a>'),
    ('aria-label="Toggle menu"', 'aria-label="Buka menu"'),
    ('class="mobile-menu__link">Service</a>', 'class="mobile-menu__link">Perkhidmatan</a>'),
    ('class="mobile-menu__link">Deployment</a>', 'class="mobile-menu__link">Pelaksanaan</a>'),
    ('class="mobile-menu__link">How it works</a>', 'class="mobile-menu__link">Cara ia berfungsi</a>'),
    ('class="mobile-menu__link">FAQ</a>', 'class="mobile-menu__link">Soalan lazim</a>'),
    ('class="mobile-menu__link">Order</a>', 'class="mobile-menu__link">Tempah</a>'),
    ('class="mobile-menu__link">Support</a>', 'class="mobile-menu__link">Sokongan</a>'),
    ('<a href="/ms" hreflang="ms" lang="ms" class="mobile-menu__link">Bahasa Malaysia</a>', '<a href="/" hreflang="en" lang="en" class="mobile-menu__link">English</a>'),
    # hero
    ('style="--n:0">Authorised Starlink installer</span>', 'style="--n:0">Pemasang Starlink yang sah</span>'),
    ("High-speed internet <br />for rural Sarawak", "Internet laju <br />untuk luar bandar Sarawak"),
    ("Starlink satellite broadband delivered, installed and supported by a local\n        Malaysian team, from Kuching to the longhouses of the Baram.",
     "Internet satelit Starlink yang dihantar, dipasang dan disokong oleh pasukan\n        tempatan Malaysia, dari Kuching hingga ke rumah panjang di Baram."),
    ('<a href="#order" class="btn btn--dark">Check availability</a>', '<a href="#order" class="btn btn--dark">Semak liputan</a>'),
    ('<a href="#how-it-works" class="btn btn--ghost">How it works</a>', '<a href="#how-it-works" class="btn btn--ghost">Cara ia berfungsi</a>'),
    ('alt="Painting of limestone pinnacles rising from rainforest in Sarawak"', 'alt="Lukisan puncak batu kapur di tengah hutan hujan Sarawak"'),
    # reliable
    ('<span class="meta">Service <i></i> Reliability</span>', '<span class="meta">Perkhidmatan <i></i> Kebolehpercayaan</span>'),
    ("Reliable &amp; resilient", "Boleh dipercayai &amp; tahan lasak"),
    ("Starlink provides high-speed, low-latency satellite internet with more than\n          99% average uptime and reliable connectivity across rural Sarawak.",
     "Starlink menyediakan internet satelit berkelajuan tinggi dan berkependaman rendah\n          dengan purata masa operasi melebihi 99% serta sambungan yang stabil di seluruh luar bandar Sarawak."),
    ("Designed to endure the elements, Starlink kits can withstand heavy rain,\n          heat and harsh winds.",
     "Direka untuk menghadapi cuaca, kit Starlink tahan hujan lebat,\n          panas dan angin kencang."),
    ("All sites operational", "Semua tapak beroperasi"),
    ("Last 90 days", "90 hari lepas"),
    ("Illustrative data", "Data ilustrasi"),
    ("View all sites", "Lihat semua tapak"),
    # terminal
    ('<span id="sitemapCount">30</span> sites', '<span id="sitemapCount">30</span> tapak'),
    ("Map of Desalink sites across Sarawak", "Peta tapak Desalink di seluruh Sarawak"),
    ('<i class="dot dot--connected"></i>Connected', '<i class="dot dot--connected"></i>Bersambung'),
    ('<i class="dot dot--pending"></i>Pending', '<i class="dot dot--pending"></i>Menunggu'),
    ('<i class="dot dot--inactive"></i>Inactive', '<i class="dot dot--inactive"></i>Tidak aktif'),
    ("Desalink Terminal <i></i> Multi-site", "Desalink Terminal <i></i> Berbilang tapak"),
    ("A bird's-eye view of every site", "Pandangan menyeluruh setiap tapak"),
    ("Deploy and manage Starlink across multiple villages without the overhead.\n          Track uptime, bandwidth and hardware status for every installation from one screen.",
     "Pasang dan urus Starlink di banyak kampung tanpa kerumitan.\n          Pantau masa operasi, lebar jalur dan status perkakasan setiap pemasangan dari satu skrin."),
    (">View live demo</button>", ">Lihat demo langsung</button>"),
    # deployment
    ('<span class="meta">Service <i></i> Deployment</span>', '<span class="meta">Perkhidmatan <i></i> Pelaksanaan</span>'),
    ("Deployed fast", "Dipasang dengan pantas"),
    ("Most on-site installations are completed within 2–4 hours. Once you confirm\n          your order, our certified technicians can usually be on site within 24–48 hours.",
     "Kebanyakan pemasangan di tapak siap dalam 2–4 jam. Sebaik sahaja anda mengesahkan\n          tempahan, juruteknik kami yang bertauliah biasanya boleh tiba di tapak dalam 24–48 jam."),
    ("Complex multi-site rollouts are scheduled around your project's scope.", "Pelaksanaan berbilang tapak yang kompleks dijadualkan mengikut skop projek anda."),
    ("<span>Image: technician on site</span>", "<span>Imej: juruteknik di tapak</span>"),
    # numbers
    ("Desalink in numbers", "Desalink dalam angka"),
    ("Average uptime across Starlink's network", "Purata masa operasi rangkaian Starlink"),
    ('<span class="tile__num">2–4h</span>', '<span class="tile__num">2–4 jam</span>'),
    ("Typical on-site installation time", "Tempoh biasa pemasangan di tapak"),
    ('<span class="tile__num">24–48h</span>', '<span class="tile__num">24–48 jam</span>'),
    ("From confirmed order to technician on site", "Dari tempahan disahkan hingga juruteknik tiba"),
    ('<span class="tile__num">7 days</span>', '<span class="tile__num">7 hari</span>'),
    ("WhatsApp support, every week of the year", "Sokongan WhatsApp, setiap minggu sepanjang tahun"),
    # how it works
    ('<h2 class="h2">How it works</h2>', '<h2 class="h2">Cara ia berfungsi</h2>'),
    ('class="textlink">Get started</a>', 'class="textlink">Mulakan</a>'),
    ('alt="Two engineers in hard hats reviewing site plans"', 'alt="Dua jurutera bertopi keselamatan menyemak pelan tapak"'),
    ('<span class="tile__label">Consultation</span>', '<span class="tile__label">Konsultasi</span>'),
    ("We assess your site and recommend the right plan", "Kami menilai tapak anda dan mencadangkan pelan yang sesuai"),
    ("Step 01 <i></i> No technical knowledge needed", "Langkah 01 <i></i> Tiada pengetahuan teknikal diperlukan"),
    ('alt="Technician mounting a Starlink dish on a house"', 'alt="Juruteknik memasang piring Starlink di atas rumah"'),
    ('<span class="tile__label">Installation</span>', '<span class="tile__label">Pemasangan</span>'),
    ("Certified technicians handle mounting, cabling and setup", "Juruteknik bertauliah menguruskan pemasangan, pendawaian dan tetapan"),
    ("Step 02 <i></i> However remote", "Langkah 02 <i></i> Walau sejauh mana pun"),
    ('alt="Technician troubleshooting a network rack on a laptop"', 'alt="Juruteknik menyelesaikan masalah rak rangkaian dengan komputer riba"'),
    ('<span class="tile__label">Support</span>', '<span class="tile__label">Sokongan</span>'),
    ("Local after-sales support, troubleshooting and plan management", "Sokongan selepas jualan, penyelesaian masalah dan pengurusan pelan oleh pasukan tempatan"),
    ("Step 03 <i></i> Ongoing", "Langkah 03 <i></i> Berterusan"),
    # spacex
    ("Engineered by SpaceX", "Direka oleh SpaceX"),
    ("SpaceX is the world's leading provider of launch services and the only\n          provider with an orbital-class reusable rocket, with deep experience in both\n          spacecraft and on-orbit operations.",
     "SpaceX ialah penyedia perkhidmatan pelancaran terkemuka dunia dan satu-satunya\n          penyedia dengan roket kelas orbit yang boleh diguna semula, dengan pengalaman luas\n          dalam kapal angkasa dan operasi di orbit."),
    ("Learn more at spacex.com", "Ketahui lebih lanjut di spacex.com"),
    ('alt="Painting looking down on a Starship rocket lifting off at night through clouds of exhaust"',
     'alt="Lukisan roket Starship berlepas pada waktu malam menembusi kepulan asap"'),
    # order
    ("Ready to connect?", "Sedia untuk bersambung?"),
    ("Check if Desalink is available in your area. Enter your 5-digit postcode and we'll reach out.",
     "Semak sama ada Desalink tersedia di kawasan anda. Masukkan poskod 5 digit anda dan kami akan menghubungi anda."),
    ('aria-label="Postcode"', 'aria-label="Poskod"'),
    ("Postcode digit ", "Digit poskod "),
    (" of 5\"", " daripada 5\""),
    ("Enter your 5-digit postcode.", "Masukkan poskod 5 digit anda."),
    ('<span class="btn__label">Check availability</span>', '<span class="btn__label">Semak liputan</span>'),
    # support
    ("We're here to help", "Kami sedia membantu"),
    ('tile__num--sm">Call</span>', 'tile__num--sm">Telefon</span>'),
    ("Mon–Fri <i></i> 8am–6pm MYT", "Isnin–Jumaat <i></i> 8 pagi–6 petang MYT"),
    ('tile__num--sm">Email</span>', 'tile__num--sm">E-mel</span>'),
    ("Response <i></i> Within 24 hours", "Maklum balas <i></i> Dalam 24 jam"),
    ("Available <i></i> 7 days a week", "Tersedia <i></i> 7 hari seminggu"),
    # live demo
    ('aria-label="Filter sites"', 'aria-label="Tapis tapak"'),
    ('data-filter="all">All <span>', 'data-filter="all">Semua <span>'),
    ('data-filter="connected">Connected <span>', 'data-filter="connected">Bersambung <span>'),
    ('data-filter="pending">Pending <span>', 'data-filter="pending">Menunggu <span>'),
    ('data-filter="inactive">Inactive <span>', 'data-filter="inactive">Tidak aktif <span>'),
    ('aria-label="Close"', 'aria-label="Tutup"'),
    ("<dt>Uptime (30d)</dt>", "<dt>Masa operasi (30 hari)</dt>"),
    ("<dt>Latency</dt>", "<dt>Kependaman</dt>"),
    ("<dt>Download</dt>", "<dt>Muat turun</dt>"),
    ("<span>Data this month</span>", "<span>Data bulan ini</span>"),
    ('<span>Site</span><span>Latency</span><span>Uptime</span>', '<span>Tapak</span><span>Kependaman</span><span>Masa operasi</span>'),
    ("Plan a multi-site rollout", "Rancang pelaksanaan berbilang tapak"),
]


def build_ms(en_html):
    s = patch_home(en_html, "ms")
    for a, b in MS:
        assert a in s, f"MS: not found: {a[:70]}"
        s = s.replace(a, b)
    return s

# ---------------------------------------------------------------- town and guide pages

NAV = '''  <nav class="nav" id="navbar">
    <a href="/" class="nav__logo"><img src="/desalinklogo.svg" alt="Desalink" class="nav__logo-img" /></a>
    <div class="nav__links">
      <a href="/#reliable">Service</a>
      <a href="/#fleet">Terminal</a>
      <a href="/#how-it-works">How it works</a>
      <a href="/#faq">FAQ</a>
      <a href="/#support">Support</a>
      <a href="/ms" hreflang="ms" lang="ms" class="nav__lang">BM</a>
    </div>
    <a href="#order" class="btn btn--dark nav__cta">Check availability</a>
    <button class="nav__hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span>
    </button>
  </nav>

  <div class="mobile-menu" id="mobileMenu">
    <a href="/" class="mobile-menu__link">Home</a>
    <a href="/#areas" class="mobile-menu__link">Areas</a>
    <a href="/starlink-price-malaysia" class="mobile-menu__link">Pricing</a>
    <a href="/#faq" class="mobile-menu__link">FAQ</a>
    <a href="#order" class="mobile-menu__link">Order</a>
    <a href="/#support" class="mobile-menu__link">Support</a>
    <a href="/ms" hreflang="ms" lang="ms" class="mobile-menu__link">Bahasa Malaysia</a>
  </div>'''

ORDER = '''  <section class="cta" id="order">
    <div class="cta__inner">
      <div class="cta__text">
        <h2 class="cta__title">Ready to connect?</h2>
        <p>Check if Desalink is available in your area. Enter your 5-digit postcode and we'll reach out.</p>
      </div>
      <form class="order__form cta__form t-input-wrap" novalidate>
        <div class="otp t-input" id="postcode" role="group" aria-label="Postcode" aria-describedby="ctaError">
''' + "\n".join(
    f'          <input class="otp__box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="{"postal-code" if i == 1 else "off"}" aria-label="Postcode digit {i} of 5" />'
    for i in range(1, 6)) + '''
          <span class="otp__done" aria-hidden="true">
            <svg viewBox="0 0 28 28"><path d="M8 14.5l4.2 4.2L20.5 9.8" /></svg>
          </span>
        </div>
        <span class="cta__error t-error-msg" id="ctaError">Enter your 5-digit postcode.</span>
        <button type="submit" class="btn btn--light cta__submit"><span class="btn__label">Check availability</span></button>
        <span class="sr-only" id="ctaStatus" role="status" aria-live="polite"></span>
      </form>
    </div>
  </section>'''


def head(title, description, url, og_type="website"):
    t, d = html.escape(title), html.escape(description)
    return f'''<!DOCTYPE html>
<html lang="en-MY">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#f6f5f2" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#111110" media="(prefers-color-scheme: dark)" />
  <title>{t}</title>
  <meta name="description" content="{d}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="{url}" />

  <meta property="og:type" content="{og_type}" />
  <meta property="og:site_name" content="Desalink" />
  <meta property="og:locale" content="en_MY" />
  <meta property="og:url" content="{url}" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:image" content="{SITE}/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{t}" />
  <meta name="twitter:description" content="{d}" />
  <meta name="twitter:image" content="{SITE}/images/og-image.jpg" />
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />'''


def page(p, kind):
    url = f"{SITE}/{p['slug']}"
    h1 = p.get("h1") or f"Starlink installation in {p['name']}"
    crumb_mid = ("Areas", "/#areas") if kind == "town" else ("Guides", "/#faq")
    crumbs = [("Home", f"{SITE}/"), (crumb_mid[0], f"{SITE}{crumb_mid[1]}"), (p["name"], url)]

    graph = [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]},
        faq_ld(p["faq"], url),
    ]
    if kind == "town":
        graph.insert(0, {"@type": "Service", "@id": f"{url}#service", "name": f"Starlink installation in {p['name']}",
                         "serviceType": "Satellite internet installation", "provider": {"@id": f"{SITE}/#business"},
                         "areaServed": [{"@type": "Place", "name": n} for n in p["places"]] + [{"@type": "State", "name": "Sarawak"}],
                         "url": url, "description": p["description"]})
    else:
        graph.insert(0, {"@type": "Article", "@id": f"{url}#article", "headline": h1, "description": p["description"],
                         "datePublished": "2026-10-20", "dateModified": TODAY, "inLanguage": "en-MY",
                         "author": {"@id": f"{SITE}/#business"}, "publisher": {"@id": f"{SITE}/#business"},
                         "image": f"{SITE}{p['image'][0]}" if p.get("image") else f"{SITE}/images/og-image.jpg",
                         "mainEntityOfPage": url})
    graph.append(BUSINESS)

    # Body
    if kind == "town":
        chips = "".join(f"<li>{n}</li>" for n in p["places"])
        body = "\n".join(f"          <h2>{h}</h2>\n          {c}" for h, c in p["sections"])
        body += f'\n          <h2>Areas we cover around {p["name"]}</h2>\n          <ul class="chips">{chips}</ul>'
        facts = [("Install time", "2–4 hours"), ("On site", "Usually 24–48h"), ("Support", "WhatsApp, 7 days"),
                 ("Coverage", f"{p['name']} &amp; surrounds")]
        media = '''      <picture>
        <source srcset="/images/headernight.jpg" media="(prefers-color-scheme: dark)" />
        <img class="article__img article__img--painting" src="/images/header.jpg" width="1731" height="909" fetchpriority="high"
             alt="Painting of limestone pinnacles rising from rainforest in Sarawak" />
      </picture>'''
        meta = f"Starlink in {p['name']}"
        related = [g for g in GUIDES] + [t for t in TOWNS if t["slug"] != p["slug"]][:3]
    else:
        body = "          " + p["body"]
        facts = p["facts"]
        if p.get("image"):
            src, w, hgt, alt = p["image"]
            media = f'      <img class="article__img" src="{src}" width="{w}" height="{hgt}" fetchpriority="high" alt="{alt}" />'
        else:
            media = ""
        meta = "Guide"
        related = [g for g in GUIDES if g["slug"] != p["slug"]] + TOWNS[:4]

    facts_html = "\n".join(f"            <div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in facts)
    crumbs_html = '<a href="/">Home</a><span aria-hidden="true">/</span>' \
        f'<a href="{crumb_mid[1]}">{crumb_mid[0]}</a><span aria-hidden="true">/</span><span aria-current="page">{p["name"]}</span>'
    related_html = "\n".join(f'''        <a class="tile" href="/{r["slug"]}">
          <div class="tile__box tile__box--short"><span class="tile__num tile__num--sm">{r["name"] if r in TOWNS else "Guide"}</span></div>
          <h3>{"Starlink in " + r["name"] if r in TOWNS else r["name"]}</h3>
        </a>''' for r in related[:6])

    return f'''{head(p["title"], p["description"], url, "website" if kind == "town" else "article")}
  {ld_script(graph)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css?v={CSS_V}" />
</head>
<body>

{NAV}

  <main>
    <article class="article">
      <header class="article__head t-stagger">
        <nav class="crumbs mono hero__line" style="--n:0" aria-label="Breadcrumb">{crumbs_html}</nav>
        <h1 class="article__title hero__line" style="--n:1">{h1}</h1>
        <p class="article__lead hero__line" style="--n:2">{p["lead"]}</p>
        <div class="hero__actions article__actions hero__line" style="--n:3">
          <a href="#order" class="btn btn--dark">Check availability</a>
          <a href="https://wa.me/60128871906" target="_blank" rel="noopener" class="btn btn--ghost">WhatsApp us</a>
        </div>
      </header>
{media}
      <div class="article__grid">
        <div class="prose">
{body}
        </div>
        <aside class="facts" aria-label="At a glance">
          <span class="meta">{meta} <i></i> At a glance</span>
          <dl>
{facts_html}
          </dl>
          <a href="#order" class="btn btn--dark facts__cta">Check availability</a>
        </aside>
      </div>
    </article>

    {faq_section(p["faq"], heading="Questions, answered", meta=meta)}

    <section class="section" id="related">
      <h2 class="h2">Keep reading</h2>
      <div class="tiles tiles--3">
{related_html}
      </div>
    </section>
  </main>

{ORDER}

  {footer("en")}

  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.js"
          integrity="sha384-bopE5cbMjKUprmGnIRk2UdvCnHImrRLCtNW2uR6oDYqO+o3XWJeuIrWWxDzeDgNW"
          crossorigin="anonymous" referrerpolicy="no-referrer" defer></script>
  <script src="/script.js?v={JS_V}"></script>
</body>
</html>
'''

# ---------------------------------------------------------------- sitemap

def sitemap():
    alt = (f'    <xhtml:link rel="alternate" hreflang="en-MY" href="{SITE}/" />\n'
           f'    <xhtml:link rel="alternate" hreflang="ms-MY" href="{SITE}/ms" />\n'
           f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}/" />\n')
    urls = [f"  <url>\n    <loc>{SITE}/</loc>\n    <lastmod>{TODAY}</lastmod>\n{alt}"
            f"    <image:image><image:loc>{SITE}/images/header.jpg</image:loc></image:image>\n  </url>",
            f"  <url>\n    <loc>{SITE}/ms</loc>\n    <lastmod>{TODAY}</lastmod>\n{alt}  </url>"]
    urls += [f"  <url>\n    <loc>{SITE}/{p['slug']}</loc>\n    <lastmod>{TODAY}</lastmod>\n  </url>" for p in GUIDES + TOWNS]
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
            '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
            '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
            + "\n".join(urls) + "\n</urlset>\n")


def main():
    index = ROOT / "index.html"
    en = patch_home(index.read_text(), "en")
    index.write_text(en)
    (ROOT / "ms").mkdir(exist_ok=True)
    (ROOT / "ms" / "index.html").write_text(build_ms(en))
    for t in TOWNS:
        (ROOT / f"{t['slug']}.html").write_text(page(t, "town"))
    for g in GUIDES:
        (ROOT / f"{g['slug']}.html").write_text(page(g, "guide"))
    (ROOT / "sitemap.xml").write_text(sitemap())
    print(f"Built index, ms, {len(TOWNS)} towns, {len(GUIDES)} guides, sitemap")


if __name__ == "__main__":
    main()

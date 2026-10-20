# Copy for the generated pages. build_pages.py turns this into HTML.
# Answers in FAQ lists may contain simple inline HTML (links); it is stripped
# for the structured data.

FAQ = {
    "en": [
        ("Is Starlink available in Malaysia?",
         "Yes. Starlink is licensed in Malaysia and works across the whole country, including the interior of Sarawak where fibre and mobile coverage don't reach. All you need is a clear view of the sky."),
        ("Which parts of Sarawak do you install in?",
         'We install across Sarawak, including <a href="/starlink-kuching">Kuching</a>, Samarahan, Serian, Sri Aman, Betong, Sarikei, <a href="/starlink-sibu">Sibu</a>, Mukah, <a href="/starlink-kapit">Kapit</a>, <a href="/starlink-bintulu">Bintulu</a>, <a href="/starlink-miri">Miri</a>, Limbang and the longhouses of the <a href="/starlink-baram">Baram</a> and Belaga. If your site is elsewhere in Malaysia, get in touch and we\'ll tell you what\'s possible.'),
        ("How much does Starlink cost in Malaysia?",
         'Starlink sets the hardware and plan prices. As of mid-2026 the Standard kit is RM1,600 and residential plans start at RM135 a month. Installation is quoted after a quick site check. See our <a href="/starlink-price-malaysia">Starlink price guide</a> for the full breakdown.'),
        ("How long does a Starlink installation take?",
         "Most on-site installations are completed within 2–4 hours. Once you confirm your order, our certified technicians can usually be on site within 24–48 hours. Multi-site rollouts are scheduled around your project's scope."),
        ("Does Starlink work in heavy rain?",
         "Yes. Starlink kits are built to withstand heavy rain, heat and strong winds. Very intense tropical downpours can briefly slow the connection, but service recovers on its own as the rain passes."),
        ("Can you set up Starlink for schools, clinics, plantations or multiple villages?",
         'Yes. We plan and install <a href="/starlink-for-business">multi-site rollouts</a> and track uptime, bandwidth and hardware status for every site from the Desalink Terminal, so one team can look after dozens of locations.'),
        ("What support do I get after installation?",
         "Our local team gives you after-sales support, troubleshooting and plan management. You can reach us on WhatsApp 7 days a week, by phone Monday to Friday, or by email."),
    ],
    "ms": [
        ("Adakah Starlink tersedia di Malaysia?",
         "Ya. Starlink dilesenkan di Malaysia dan berfungsi di seluruh negara, termasuk kawasan pedalaman Sarawak yang tidak dicapai oleh gentian optik dan liputan mudah alih. Anda hanya perlukan pandangan langit yang jelas."),
        ("Di kawasan mana di Sarawak anda membuat pemasangan?",
         'Kami membuat pemasangan di seluruh Sarawak, termasuk <a href="/starlink-kuching">Kuching</a>, Samarahan, Serian, Sri Aman, Betong, Sarikei, <a href="/starlink-sibu">Sibu</a>, Mukah, <a href="/starlink-kapit">Kapit</a>, <a href="/starlink-bintulu">Bintulu</a>, <a href="/starlink-miri">Miri</a>, Limbang serta rumah panjang di <a href="/starlink-baram">Baram</a> dan Belaga. Jika tapak anda di tempat lain di Malaysia, hubungi kami dan kami akan maklumkan apa yang boleh dilakukan.'),
        ("Berapakah harga Starlink di Malaysia?",
         'Harga perkakasan dan pelan ditetapkan oleh Starlink. Setakat pertengahan 2026, kit Standard berharga RM1,600 dan pelan kediaman bermula pada RM135 sebulan. Kos pemasangan disebut harga selepas semakan tapak yang ringkas. Lihat <a href="/starlink-price-malaysia">panduan harga Starlink</a> kami (dalam bahasa Inggeris) untuk butiran penuh.'),
        ("Berapa lama masa untuk memasang Starlink?",
         "Kebanyakan pemasangan di tapak siap dalam 2–4 jam. Sebaik sahaja anda mengesahkan tempahan, juruteknik kami yang bertauliah biasanya boleh tiba di tapak dalam 24–48 jam. Pelaksanaan berbilang tapak dijadualkan mengikut skop projek anda."),
        ("Adakah Starlink berfungsi semasa hujan lebat?",
         "Ya. Kit Starlink direka untuk tahan hujan lebat, panas dan angin kencang. Hujan tropika yang sangat lebat boleh memperlahankan sambungan buat seketika, tetapi perkhidmatan akan pulih dengan sendirinya selepas hujan reda."),
        ("Bolehkah anda memasang Starlink untuk sekolah, klinik, ladang atau beberapa kampung?",
         'Boleh. Kami merancang dan memasang <a href="/starlink-for-business">pelaksanaan berbilang tapak</a> serta memantau masa operasi, lebar jalur dan status perkakasan setiap tapak melalui Desalink Terminal, supaya satu pasukan boleh menjaga berpuluh-puluh lokasi.'),
        ("Apakah sokongan yang saya terima selepas pemasangan?",
         "Pasukan tempatan kami menyediakan sokongan selepas jualan, penyelesaian masalah dan pengurusan pelan. Hubungi kami melalui WhatsApp 7 hari seminggu, telefon pada hari Isnin hingga Jumaat, atau e-mel."),
    ],
}

# Town pages. `places` become the chip list; `sections` are (heading, html).
TOWNS = [
    {
        "slug": "starlink-kuching",
        "name": "Kuching",
        "title": "Starlink Installation in Kuching, Sarawak | Desalink",
        "description": "Starlink installation in Kuching and the surrounding districts: Padawan, Bau, Lundu, Serian and Samarahan. Installed in 2–4 hours by certified technicians.",
        "lead": "Satellite internet for homes, kampung and businesses around Kuching, from the Padawan hills to the coast at Lundu and Sematan.",
        "places": ["Kuching city", "Petra Jaya", "Batu Kawa", "Matang", "Padawan", "Siburan", "Bau", "Lundu", "Sematan", "Serian", "Samarahan", "Asajaya"],
        "sections": [
            ("Who we install for around Kuching",
             "<p>Kuching city has good fibre, but coverage thins out quickly once you leave the main roads. We install Starlink for:</p>"
             "<ul><li><strong>Homes and kampung</strong> in Padawan, Bau, Lundu and Serian where fibre hasn't arrived and mobile data is patchy.</li>"
             "<li><strong>Homestays, farms and resorts</strong> on the coast and in the hills that need reliable Wi-Fi for guests and bookings.</li>"
             "<li><strong>Shops and offices</strong> in town that want a backup connection when their fibre line goes down.</li></ul>"),
            ("Why Starlink works well here",
             "<p>Starlink only needs a clear view of the sky, so it isn't limited by how far you are from the nearest exchange or tower. Hilly ground around Padawan and Bau that blocks mobile signal doesn't matter to a dish pointed straight up.</p>"
             "<p>The main thing we check on site is tree cover. Tall trees around a house are the most common cause of interruptions, and part of our job is finding the mounting spot, or pole height, that clears them.</p>"),
            ("How installation works in Kuching",
             "<p>Send us your location and a few photos of your roof and surroundings on WhatsApp. We'll recommend the right kit and plan, then book a technician. Most sites around Kuching are visited within 24–48 hours of confirming your order, and the installation itself takes 2–4 hours.</p>"),
        ],
        "faq": [
            ("Do I need Starlink if I live in Kuching city?",
             "If you already have fibre that works well, usually not. Starlink makes most sense on the edges of town and in rural districts where fibre isn't available, or as a backup line for a business that can't afford to go offline."),
            ("Can you install Starlink at a homestay or resort near Kuching?",
             'Yes. We size the Wi-Fi to cover guest rooms and common areas, not just the main building. For larger sites, see <a href="/starlink-for-business">Starlink for business</a>.'),
            ("How much does Starlink cost in Kuching?",
             'Hardware and plan prices are the same everywhere in Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation is quoted after a site check, based on mounting and cable run.'),
        ],
    },
    {
        "slug": "starlink-miri",
        "name": "Miri",
        "title": "Starlink Installation in Miri, Sarawak | Desalink",
        "description": "Starlink installation in Miri, Niah, Bekenu, Sibuti and Marudi. Certified technicians and local support for homes, longhouses and businesses in northern Sarawak.",
        "lead": "Satellite internet across Miri Division, from the city and the coast at Bekenu to Niah, Sibuti and the gateway to the Baram.",
        "places": ["Miri city", "Lutong", "Senadin", "Lambir", "Bekenu", "Sibuti", "Niah", "Batu Niah", "Marudi", "Beluru"],
        "sections": [
            ("Who we install for around Miri",
             "<p>Outside the city, much of Miri Division depends on long stretches of road with weak mobile coverage. We install Starlink for:</p>"
             "<ul><li><strong>Homes and longhouses</strong> along the coastal road and inland around Niah, Sibuti and Beluru.</li>"
             "<li><strong>Plantation estates, worker quarters and site offices</strong> that need dependable connectivity away from town.</li>"
             "<li><strong>Tourism operators</strong> near the national parks who need Wi-Fi for guests and online bookings.</li></ul>"),
            ("Gateway to the Baram",
             '<p>Miri is the starting point for most of our work further inland. For longhouses along the Baram, around Marudi, Long Lama and beyond, we plan the journey with you, whether by road or river. Read more on our <a href="/starlink-baram">Baram page</a>.</p>'),
            ("How installation works in Miri",
             "<p>Message us your location with photos of the roof and surroundings. We'll confirm the right kit and plan, then book a technician. Sites close to Miri are usually visited within 24–48 hours of confirming your order; remote sites are scheduled around travel.</p>"),
        ],
        "faq": [
            ("Does Starlink work in Niah and Sibuti?",
             "Yes. Starlink works anywhere with a clear view of the sky. In plantation areas we check for tall trees around the mounting point and use a pole mount where needed."),
            ("Can you connect a plantation or several estates around Miri?",
             'Yes. We install and look after multi-site setups and monitor every site from the Desalink Terminal. See <a href="/starlink-for-business">Starlink for business</a>.'),
            ("How much does Starlink cost in Miri?",
             'Hardware and plan prices are set by Starlink and are the same across Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation is quoted per site.'),
        ],
    },
    {
        "slug": "starlink-sibu",
        "name": "Sibu",
        "title": "Starlink Installation in Sibu, Sarawak | Desalink",
        "description": "Starlink installation in Sibu, Kanowit, Sarikei, Julau and longhouses along the Rajang. Certified technicians and 7-day WhatsApp support.",
        "lead": "Satellite internet for Sibu and the Rajang basin, from town to the longhouses upriver at Kanowit, Julau and Song.",
        "places": ["Sibu town", "Sibu Jaya", "Durin", "Selangau", "Kanowit", "Song", "Sarikei", "Bintangor", "Julau", "Pakan", "Meradong"],
        "sections": [
            ("Who we install for around Sibu",
             "<p>Sibu sits at the heart of the Rajang, and many of the communities it serves are along the river and its tributaries, where fibre will be a long time coming. We install Starlink for:</p>"
             "<ul><li><strong>Longhouses along the Rajang</strong>, with Wi-Fi that reaches along the ruai and into each bilik.</li>"
             "<li><strong>Homes and farms</strong> around Selangau, Durin, Julau and Pakan.</li>"
             "<li><strong>Shops, timber and agriculture businesses</strong> that need a reliable link for payments, orders and reporting.</li></ul>"),
            ("Working on the river",
             '<p>Some sites around Sibu are easiest to reach by boat. We plan the trip, kit and mounting materials in advance so the installation can be finished in one visit. Read <a href="/starlink-for-longhouses">Starlink for longhouses</a> for how we set up shared Wi-Fi along a longhouse.</p>'),
            ("How installation works in Sibu",
             "<p>Send us your location and photos of the roof and surroundings on WhatsApp. We'll recommend the kit and plan, then schedule a technician. Sites near Sibu are usually visited within 24–48 hours of confirming your order; river sites are scheduled around travel.</p>"),
        ],
        "faq": [
            ("Can one Starlink cover a whole longhouse?",
             'One dish provides the connection; the Wi-Fi is what has to stretch. For a long building we add access points along the ruai so every bilik gets a usable signal. See <a href="/starlink-for-longhouses">Starlink for longhouses</a>.'),
            ("Does Starlink work along the Rajang?",
             "Yes. Starlink works anywhere with a clear view of the sky, including riverside longhouses. The main thing we check is tree cover around the mounting point."),
            ("How much does Starlink cost in Sibu?",
             'Hardware and plan prices are the same across Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation is quoted after a site check.'),
        ],
    },
    {
        "slug": "starlink-bintulu",
        "name": "Bintulu",
        "title": "Starlink Installation in Bintulu, Sarawak | Desalink",
        "description": "Starlink installation in Bintulu, Tatau, Sebauh and Samalaju. Reliable satellite internet for homes, plantations, camps and industrial sites.",
        "lead": "Satellite internet for Bintulu, Tatau and Sebauh, and for the plantations, camps and project sites in between.",
        "places": ["Bintulu town", "Kidurong", "Tanjung Kidurong", "Samalaju", "Sebauh", "Tatau", "Kuala Tatau", "Labang"],
        "sections": [
            ("Who we install for around Bintulu",
             "<p>Bintulu's industry and agriculture are spread over a wide area, and many sites sit well beyond reliable mobile coverage. We install Starlink for:</p>"
             "<ul><li><strong>Plantations, estates and worker quarters</strong>, with Wi-Fi sized for the people living there.</li>"
             "<li><strong>Project sites, camps and temporary offices</strong> that need a fast connection from day one.</li>"
             "<li><strong>Homes and longhouses</strong> around Sebauh, Tatau and Labang.</li></ul>"),
            ("Built for multi-site operations",
             '<p>If you run several estates or sites, the Desalink Terminal lets you track uptime, bandwidth and hardware status for every installation from one screen, and our team handles the rollout site by site. See <a href="/starlink-for-business">Starlink for business</a>.</p>'),
            ("How installation works in Bintulu",
             "<p>Send us your locations and photos of each site on WhatsApp. We'll recommend kit and plans, then schedule technicians. Sites near Bintulu are usually visited within 24–48 hours of confirming your order; larger rollouts are scheduled around your project.</p>"),
        ],
        "faq": [
            ("Can Starlink be moved between project sites?",
             "Yes. The hardware can be relocated when a project moves, and we can take down and reinstall it at the new site. Talk to us about which Starlink plan suits a site that moves."),
            ("Can you connect worker quarters on a plantation?",
             "Yes. We plan the Wi-Fi around the buildings so coverage reaches where people actually live, not just the estate office."),
            ("How much does Starlink cost in Bintulu?",
             'Hardware and plan prices are the same across Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation is quoted per site.'),
        ],
    },
    {
        "slug": "starlink-kapit",
        "name": "Kapit",
        "title": "Starlink Installation in Kapit, Sarawak | Desalink",
        "description": "Starlink installation in Kapit, Song, Belaga and longhouses along the Rajang and Baleh. Satellite internet where fibre and mobile coverage don't reach.",
        "lead": "Satellite internet for Kapit Division, from Kapit town to the longhouses along the Rajang, the Baleh and upriver to Belaga.",
        "places": ["Kapit town", "Song", "Nanga Merit", "Sungai Baleh", "Belaga", "Bakun", "Sungai Asap"],
        "sections": [
            ("Who we install for around Kapit",
             "<p>Kapit Division covers some of the most remote country in Sarawak. Many communities rely on the river, with little or no mobile coverage. We install Starlink for:</p>"
             "<ul><li><strong>Longhouses</strong> along the Rajang and Baleh, with Wi-Fi along the ruai and into each bilik.</li>"
             "<li><strong>Schools, clinics and community halls</strong> that need a dependable link for teaching, records and calls.</li>"
             "<li><strong>Shops and small businesses</strong> in Kapit town, Song and Belaga.</li></ul>"),
            ("Planning remote installations",
             "<p>For upriver and logging-road sites we plan the trip with you in advance: how to get there, where the dish will go, how the site is powered, and what mounting materials to bring, so the job is finished in one visit.</p>"
             '<p>Power is often the deciding factor. If a site runs on a generator or solar, we\'ll talk through how to keep the Starlink running when the power is unstable. Read <a href="/starlink-for-longhouses">Starlink for longhouses</a> for more.</p>'),
            ("How installation works in Kapit",
             "<p>Message us on WhatsApp with your location and photos of the site. We'll recommend kit and a plan, then agree a date. Remote sites are scheduled around travel, and the installation itself typically takes 2–4 hours once we're on site.</p>"),
        ],
        "faq": [
            ("Does Starlink work in Kapit?",
             "Yes. Starlink works anywhere in Kapit Division with a clear view of the sky, including longhouses along the Rajang and Baleh that have no mobile signal."),
            ("What if the longhouse only has generator power?",
             'Starlink can run on generator or solar power. We\'ll look at your power setup and recommend how to keep the connection stable. See <a href="/starlink-for-longhouses">Starlink for longhouses</a>.'),
            ("How much does Starlink cost in Kapit?",
             'Hardware and plan prices are the same everywhere in Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation for remote sites is quoted after we plan the trip with you.'),
        ],
    },
    {
        "slug": "starlink-baram",
        "name": "Baram",
        "title": "Starlink Installation in Baram & Marudi, Sarawak | Desalink",
        "description": "Starlink installation for longhouses and communities in the Baram: Marudi, Long Lama, Long San and beyond. Satellite internet, installed and supported locally.",
        "lead": "Satellite internet for the longhouses and communities of the Baram, from Marudi and Long Lama upriver to Long San and beyond.",
        "places": ["Marudi", "Long Lama", "Long San", "Long Bedian", "Long Miri", "Long Akah", "Lio Matoh", "Telang Usan"],
        "sections": [
            ("Who we install for in the Baram",
             "<p>Most of the Baram lies far beyond fibre and reliable mobile coverage. Starlink brings fast internet to places where it simply wasn't possible before. We install for:</p>"
             "<ul><li><strong>Longhouses</strong>, with shared Wi-Fi along the ruai and into each bilik.</li>"
             "<li><strong>Schools, clinics and churches</strong> that need a dependable connection for teaching, records and calls.</li>"
             "<li><strong>Homestays and small businesses</strong> in Marudi, Long Lama and upriver.</li></ul>"),
            ("Getting there",
             '<p>We plan every Baram installation with you before we travel, whether the route is by river from Marudi or along logging roads from Miri. Agreeing on mounting, power and materials in advance means the job gets done in one visit. Many trips start from <a href="/starlink-miri">Miri</a>.</p>'),
            ("How installation works in the Baram",
             '<p>Send us your location and photos of the site on WhatsApp. We\'ll recommend kit and a plan and agree a date. For several longhouses in the same area, we can combine the trip, which keeps the cost per site down. See <a href="/starlink-for-longhouses">Starlink for longhouses</a>.</p>'),
        ],
        "faq": [
            ("Does Starlink work in the Baram?",
             "Yes. Starlink works anywhere with a clear view of the sky, including upriver longhouses with no mobile coverage."),
            ("Can several longhouses share one trip?",
             "Yes. If neighbouring longhouses want Starlink, we can plan the installations together so travel is shared."),
            ("How much does Starlink cost in the Baram?",
             'Hardware and plan prices are the same across Malaysia. See our <a href="/starlink-price-malaysia">Starlink price guide</a>. Installation for remote sites is quoted after we plan the trip with you.'),
        ],
    },
]

GUIDES = [
    {
        "slug": "starlink-price-malaysia",
        "name": "Starlink price in Malaysia",
        "title": "Starlink Price in Malaysia (2026): Kit, Plans & Installation",
        "description": "How much Starlink costs in Malaysia in 2026: Standard and Mini kit prices, Residential 100 and Residential plans, installation costs and a first-year estimate.",
        "h1": "How much does Starlink cost in Malaysia?",
        "lead": "A plain breakdown of what you pay for Starlink in Malaysia: the kit, the monthly plan and installation, with a first-year estimate.",
        "image": None,
        "facts": [("Standard kit", "RM1,600"), ("Mini kit", "RM930"), ("Plans from", "RM135/month"), ("Updated", "October 2026")],
        "body":
            "<p>Starlink pricing has three parts: a one-off payment for the hardware kit, a monthly plan, and installation if you don't want to mount it yourself. Starlink sets the hardware and plan prices; we quote installation.</p>"
            "<p class=\"note\">Prices below are as reported by <a href=\"https://www.lowyat.net/2026/396556/starlink-malaysia-removes-residential-lite-plan/\" target=\"_blank\" rel=\"noopener\">Lowyat.NET</a> and <a href=\"https://www.lepaklah.com/starlink-malaysia-2026-what-it-costs-and-who-actually-needs-it\" target=\"_blank\" rel=\"noopener\">LepakLah</a> in mid-2026. Starlink changes prices from time to time, so always confirm on <a href=\"https://www.starlink.com/my\" target=\"_blank\" rel=\"noopener\">starlink.com</a> before ordering.</p>"
            "<h2>1. The hardware kit</h2>"
            "<table><thead><tr><th>Kit</th><th>Price</th><th>Best for</th></tr></thead><tbody>"
            "<tr><td>Standard</td><td>RM1,600</td><td>Homes, longhouses and businesses with a fixed location</td></tr>"
            "<tr><td>Mini</td><td>RM930</td><td>Portable use and small sites with light usage</td></tr>"
            "</tbody></table>"
            "<p>The Standard kit includes the dish and a Wi-Fi router. For a fixed home, longhouse or business, it's the one we usually recommend: it has a wider field of view and copes better with heavy use.</p>"
            "<h2>2. The monthly plan</h2>"
            "<table><thead><tr><th>Plan</th><th>Price per month</th><th>Speed</th></tr></thead><tbody>"
            "<tr><td>Residential 100</td><td>RM135</td><td>Up to 100Mbps</td></tr>"
            "<tr><td>Residential</td><td>RM235</td><td>Up to 400Mbps, unlimited data</td></tr>"
            "<tr><td>Business</td><td>From RM217</td><td>Priority data for business use</td></tr>"
            "<tr><td>Roam</td><td>From RM220</td><td>For use on the move</td></tr>"
            "</tbody></table>"
            "<p>Residential 100 replaced the older Residential Lite plan in 2026. For a household, Residential 100 is usually enough. For a longhouse with many families, a school or a business, the full Residential or a Business plan is the safer choice. We'll help you pick based on how many people will use it.</p>"
            "<h2>3. Installation</h2>"
            "<p>Starlink is designed so you can set it up yourself, and on an open site that can work. In rural Sarawak, professional installation is usually worth it because of:</p>"
            "<ul><li><strong>Trees and obstructions.</strong> Even partial blockage causes dropouts. We find the mounting spot, or pole height, that gives a clear view of the sky.</li>"
            "<li><strong>Secure mounting.</strong> A properly fixed roof or pole mount stays aligned through storms and strong wind.</li>"
            "<li><strong>Cabling and weatherproofing.</strong> Neat, sealed cable runs that won't let water into the house.</li>"
            "<li><strong>Wi-Fi coverage.</strong> Large houses and longhouses need extra access points so the signal reaches every room.</li>"
            "<li><strong>Power.</strong> Advice on running Starlink from generator or solar power.</li></ul>"
            "<p>Our installation price depends on the mounting type, cable length, extra Wi-Fi equipment and travel to your site. Send us photos on WhatsApp and we'll give you a quote before any work is booked.</p>"
            "<h2>First-year cost estimate</h2>"
            "<table><thead><tr><th>Setup</th><th>Kit</th><th>12 months of plan</th><th>Total before installation</th></tr></thead><tbody>"
            "<tr><td>Standard + Residential 100</td><td>RM1,600</td><td>RM1,620</td><td>RM3,220</td></tr>"
            "<tr><td>Standard + Residential</td><td>RM1,600</td><td>RM2,820</td><td>RM4,420</td></tr>"
            "</tbody></table>"
            "<p>From the second year, you only pay the monthly plan.</p>",
        "faq": [
            ("Is there a contract for Starlink in Malaysia?",
             "Starlink plans are billed monthly. Check the current terms on starlink.com when you order, as they can change."),
            ("Is installation included in the Starlink price?",
             "No. Starlink's kit price covers the hardware only. You can install it yourself, or we can install it for a quoted fee."),
            ("Which plan should I choose for a longhouse?",
             'It depends on how many people will be online at once. For many families sharing one connection, the full Residential plan is the safer choice. See <a href="/starlink-for-longhouses">Starlink for longhouses</a>.'),
        ],
    },
    {
        "slug": "starlink-for-longhouses",
        "name": "Starlink for longhouses",
        "title": "Starlink for Longhouses in Sarawak | Desalink",
        "description": "How to set up Starlink for a longhouse in Sarawak: Wi-Fi along the ruai and into every bilik, choosing a plan, generator and solar power, and installation.",
        "h1": "Starlink for longhouses in Sarawak",
        "lead": "How to bring fast internet to a whole longhouse, with Wi-Fi that reaches along the ruai and into every bilik.",
        "image": ("/images/install.jpg", 900, 900, "Technician mounting a Starlink dish on a house"),
        "facts": [("Install time", "2–4 hours"), ("Coverage", "Ruai and every bilik"), ("Power", "Mains, generator or solar"), ("Support", "WhatsApp, 7 days")],
        "body":
            "<p>For many longhouses in Sarawak, Starlink is the first fast internet connection that has ever been possible. Fibre won't reach most of them for years, and mobile signal is weak or missing. Starlink only needs a clear view of the sky.</p>"
            "<p>Getting it right for a longhouse is different from a single house, though. Here's how we approach it.</p>"
            "<h2>One dish, Wi-Fi along the whole building</h2>"
            "<p>A single Starlink dish provides the connection. The challenge is the Wi-Fi: the router that comes with the kit won't cover a building that can run for dozens of doors. We add access points along the ruai so the signal reaches every bilik, all connected back to the same Starlink.</p>"
            "<h2>Choosing a plan</h2>"
            "<p>The more families online at once, the more capacity you need. For a small longhouse with light use, a lower-cost plan can be enough. For a large longhouse where many people stream, study and video call in the evenings, the full Residential or a Business plan is the safer choice. See our <a href=\"/starlink-price-malaysia\">Starlink price guide</a>, and talk to us about which plan suits shared use.</p>"
            "<h2>Power</h2>"
            "<p>Starlink needs steady power. Many longhouses run on a generator for part of the day, or on solar. We'll look at your setup and recommend how to keep the connection running, for example with a small backup battery that rides through short outages and generator changeovers.</p>"
            "<h2>Weather and mounting</h2>"
            "<p>Starlink kits are built for heavy rain, heat and strong wind. What matters most is a secure mount with a clear view of the sky. Tall trees nearby are the most common cause of dropouts, so we choose the position carefully and use a pole mount where the roof isn't high enough.</p>"
            "<h2>How it works</h2>"
            "<ol><li><strong>Consultation.</strong> Send us your location and photos of the longhouse on WhatsApp. We'll recommend kit, a plan and the Wi-Fi layout.</li>"
            "<li><strong>Installation.</strong> Our technicians mount the dish, run the cabling and set up Wi-Fi along the building, usually in 2–4 hours once on site.</li>"
            "<li><strong>Support.</strong> Our local team is on WhatsApp 7 days a week for troubleshooting and plan changes.</li></ol>",
        "faq": [
            ("Can one Starlink serve a whole longhouse?",
             "Yes, with the right Wi-Fi setup. One dish provides the connection, and access points along the ruai carry the signal to each bilik."),
            ("Will Starlink work if the longhouse has no mains power?",
             "Yes. Starlink can run on generator or solar power. We'll recommend how to keep it stable through outages."),
            ("Can several longhouses share one installation trip?",
             "Yes. If neighbouring longhouses want Starlink, we can plan the installations together so the travel cost is shared."),
        ],
    },
    {
        "slug": "starlink-for-business",
        "name": "Starlink for business",
        "title": "Starlink for Schools, Clinics & Business in Sarawak | Desalink",
        "description": "Starlink for schools, clinics, plantations and businesses in Sarawak. Multi-site rollouts, monitoring for every site from one screen, and local support.",
        "h1": "Starlink for schools, clinics and business",
        "lead": "Plan, install and manage Starlink across one site or dozens, with every installation monitored from one screen.",
        "image": ("/images/consult.jpg", 900, 599, "Two engineers in hard hats reviewing site plans"),
        "facts": [("Sites", "One to dozens"), ("Monitoring", "Desalink Terminal"), ("Install time", "2–4 hours per site"), ("Support", "Local team, 7 days")],
        "body":
            "<p>When an organisation needs internet at sites across rural Sarawak, the hard part isn't buying the hardware. It's getting every site installed properly, keeping them all online, and knowing quickly when one isn't.</p>"
            "<h2>Who we work with</h2>"
            "<ul><li><strong>Schools</strong> that need a dependable link for teaching, online learning and administration.</li>"
            "<li><strong>Clinics and health posts</strong> where records, calls and referrals depend on a connection.</li>"
            "<li><strong>Plantations and estates</strong> connecting offices, worker quarters and remote blocks.</li>"
            "<li><strong>Project sites and camps</strong> that need fast internet from day one and may move later.</li>"
            "<li><strong>Shops, homestays and offices</strong> that want a primary link, or a backup when fibre goes down.</li></ul>"
            "<h2>Multi-site rollouts</h2>"
            "<p>We plan the rollout with you: which sites first, what each one needs, how to get there and when. Each site gets the same standard of mounting, cabling and Wi-Fi, so they behave the same way and are easy to support.</p>"
            "<h2>Every site on one screen</h2>"
            "<p>The Desalink Terminal tracks uptime, bandwidth and hardware status for every installation, so you can see at a glance which sites are online and which need attention. <a href=\"/#fleet\">See the live demo</a>.</p>"
            "<h2>Plans and pricing</h2>"
            "<p>Starlink's Business plans start from around RM217 a month, alongside the residential plans. We'll recommend a plan per site based on how many people use it and what for. See our <a href=\"/starlink-price-malaysia\">Starlink price guide</a> for the current breakdown.</p>"
            "<h2>Support after installation</h2>"
            "<p>Our local team handles troubleshooting, plan changes and hardware issues, and is on WhatsApp 7 days a week.</p>",
        "faq": [
            ("How many sites can you roll out at once?",
             "We schedule rollouts around your project's scope, from a single site to dozens across the state."),
            ("Can Starlink be a backup for our fibre connection?",
             "Yes. Starlink is a good backup link because it doesn't share any infrastructure with fibre or mobile networks."),
            ("Do you install Starlink outside Sarawak?",
             "Our team is focused on Sarawak. If your sites are elsewhere in Malaysia, get in touch and we'll tell you what's possible."),
        ],
    },
]

# Homepage "areas" tiles: one line per town.
AREAS_BLURB = {
    "starlink-kuching": ("Kuching · Bau · Lundu · Serian", "Kuching · Bau · Lundu · Serian"),
    "starlink-miri": ("Miri · Niah · Sibuti · Marudi", "Miri · Niah · Sibuti · Marudi"),
    "starlink-sibu": ("Sibu · Kanowit · Sarikei · Julau", "Sibu · Kanowit · Sarikei · Julau"),
    "starlink-bintulu": ("Bintulu · Tatau · Sebauh", "Bintulu · Tatau · Sebauh"),
    "starlink-kapit": ("Kapit · Song · Belaga", "Kapit · Song · Belaga"),
    "starlink-baram": ("Marudi · Long Lama · Long San", "Marudi · Long Lama · Long San"),
}

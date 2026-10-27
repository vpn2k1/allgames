// Sinh HTML cho trang chủ, trang chi tiết game và trang chính sách từ dữ liệu game, kèm robots.txt và sitemap.xml.
export const CONTACT = 'vpnam2k1@gmail.com';
// Địa chỉ gốc cho canonical, Open Graph, JSON-LD và sitemap. Đặt SITE_URL khi gắn tên miền riêng.
export const SITE = (process.env.SITE_URL || 'https://vpngames.vercel.app').replace(/\/+$/, '');
const BRAND = 'VPN Games';
const OG_IMAGE = '/assets/og-image.png';

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isUrl = (u) => /^(https?:\/\/|\/)/.test(u || '');
const hasPrivacy = (g) => Boolean(g.privacy?.html || g.privacy?.url);
const abs = (u) => (/^https?:\/\//.test(u) ? u : `${SITE}${u}`);
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const shown = (games) => games.filter((g) => g.visible).sort(byOrder);
const clip = (s, n = 155) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};
const ld = (graph) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
const viDate = (iso) => String(iso).slice(0, 10).split('-').reverse().join('/');

const svg = (size, path) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICONS = {
  download: svg(22, '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/>'),
  store: svg(22, '<path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 016 0"/>'),
  globe: svg(22, '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'),
  shield: svg(18, '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>'),
  spark: svg(26, '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z"/>'),
  plug: svg(26, '<path d="M9 3v5m6-5v5M6 8h12v3a6 6 0 01-12 0V8zm6 9v4"/>'),
  lock: svg(26, '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
};

const FAQ = [
  ['VPN Games là gì?', 'VPN Games là nơi giới thiệu các game do chúng tôi phát triển, kèm link tải, hình ảnh và chính sách quyền riêng tư của từng game.'],
  ['Tải game ở đâu?', 'Mở trang chi tiết của game. Các nút tải hiển thị theo những kênh đã có: Google Play, App Store, file APK, bản iOS trực tiếp hoặc chơi ngay trên trình duyệt.'],
  ['Game nào chơi được offline?', 'Phần giới thiệu của mỗi game ghi rõ có cần kết nối mạng hay không. Nhiều game của VPN Games chơi hoàn toàn offline.'],
  ['Game có thu thập dữ liệu của tôi không?', 'Mỗi game có chính sách quyền riêng tư riêng. Bạn xem ở trang Quyền riêng tư hoặc ở cuối trang chi tiết của game.'],
  ['Báo lỗi hoặc góp ý ở đâu?', `Gửi email tới ${CONTACT}. Chúng tôi đọc mọi góp ý về game và về trang web.`],
];

function layout({ title, description, body, path = '/', image, type = 'website', graph = [], games = [] }) {
  const url = SITE + path;
  const links = shown(games).map((g) => `<li><a href="/game/${esc(g.slug)}">${esc(g.name)}</a></li>`).join('');
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(abs(image || OG_IMAGE))}">
${image ? '' : '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'}<meta name="twitter:card" content="${image ? 'summary' : 'summary_large_image'}">
<meta name="theme-color" content="#342668">
<link rel="icon" type="image/svg+xml" href="/assets/vpn-games-mark.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${graph.length ? ld(graph) : ''}
</head>
<body>
<a class="skip" href="#main">Bỏ qua điều hướng</a>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="/"><img class="logo" src="/assets/vpn-games-mark.svg" alt="" width="28" height="28">${BRAND}</a>
    <nav aria-label="Điều hướng chính"><a href="/#games">Game</a><a href="/#gioi-thieu">Giới thiệu</a><a href="/#hoi-dap">Hỏi đáp</a><a href="/privacy">Quyền riêng tư</a></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer>
  <div class="footer-inner">
    <div>
      <p class="foot-brand">${BRAND}</p>
      <p>Chơi vui mỗi ngày. Game giải đố, chiến thuật và dân gian Việt, chơi offline hoặc online.</p>
      <p>Liên hệ: <a href="mailto:${CONTACT}">${CONTACT}</a></p>
    </div>
    ${links ? `<nav aria-label="Danh sách game"><p class="foot-title">Game</p><ul>${links}</ul></nav>` : ''}
    <nav aria-label="Thông tin"><p class="foot-title">Thông tin</p><ul><li><a href="/#gioi-thieu">Giới thiệu</a></li><li><a href="/#hoi-dap">Hỏi đáp</a></li><li><a href="/privacy">Chính sách quyền riêng tư</a></li></ul></nav>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ${BRAND}</p>
</footer>
</body>
</html>
`;
}

/** Các nút tải/chơi của một game, chỉ gồm những link đã cấu hình. */
function downloadButtons(g) {
  const l = g.links || {};
  const items = [
    ['Tải trên', 'Google Play', l.playStore, ICONS.store, 'store'],
    ['Tải trực tiếp', 'Android (.apk)', l.androidApk, ICONS.download, 'direct'],
    ['Tải trên', 'App Store', l.appStore, ICONS.store, 'store'],
    ['Tải trực tiếp', 'iOS', l.iosDirect, ICONS.download, 'direct'],
    ['Chơi ngay trên', 'Trình duyệt', l.web, ICONS.globe, 'web'],
  ];
  return items
    .filter(([, , href]) => isUrl(href))
    .map(([cap, name, href, icon, kind]) => `<a class="dl dl-${kind}" href="${esc(href)}" rel="noopener">${icon}<span><small>${esc(cap)}</small><strong>${esc(name)}</strong></span></a>`)
    .join('');
}

function platforms(g) {
  const l = g.links || {};
  return [l.androidApk || l.playStore ? 'Android' : '', l.iosDirect || l.appStore ? 'iOS' : '', l.web ? 'Web' : ''].filter(Boolean);
}

function platformTags(g) {
  const out = platforms(g).map((t) => `<span class="tag">${t}</span>`);
  if (g.comingSoon) out.push('<span class="tag soon">Đang phát triển</span>');
  return out.join('');
}

const status = (g) => (g.comingSoon ? 'Đang phát triển' : platforms(g).length ? 'Đã phát hành' : 'Đang cập nhật link tải');

const iconImg = (g, size, cls = '', { alt = '', eager = false } = {}) =>
  g.icon
    ? `<img class="${cls}" src="${esc(g.icon)}" alt="${esc(alt)}" width="${size}" height="${size}"${eager ? '' : ' loading="lazy"'}>`
    : `<div class="icon-placeholder ${cls}" style="width:${size}px;height:${size}px"></div>`;

function gameCard(g) {
  return `<article class="card">
  ${iconImg(g, 76, 'card-icon')}
  <div class="card-body">
    <h3><a class="card-link" href="/game/${esc(g.slug)}">${esc(g.name)}</a></h3>
    ${g.subtitle ? `<p class="sub">${esc(g.subtitle)}</p>` : ''}
    <p class="tagline">${esc(g.tagline)}</p>
    <p class="platforms">${platformTags(g)}</p>
  </div>
  <span class="more" aria-hidden="true">Xem chi tiết →</span>
</article>`;
}

export function indexPage(games) {
  const visible = shown(games);
  const cards = visible.length ? visible.map(gameCard).join('\n') : '<p class="empty">Chưa có game nào được hiển thị.</p>';
  const policies = visible.filter(hasPrivacy).length;
  const soon = visible.filter((g) => g.comingSoon).length;
  const floaters = visible.filter((g) => g.icon).slice(0, 5).map((g, i) => `<img class="float f${i}" src="${esc(g.icon)}" alt="" width="84" height="84">`).join('');
  const description = clip(`Tổng hợp ${visible.length} game của ${BRAND}: puzzle, chiến thuật và trò chơi dân gian Việt, chơi offline hoặc online. Link tải và quyền riêng tư từng game.`);
  const features = [
    [ICONS.plug, 'Offline hay online tuỳ bạn', 'Nhiều game chơi hoàn toàn offline, không cần mạng. Một số game có chế độ online với bạn bè.'],
    [ICONS.spark, 'Cảm hứng từ Việt Nam', 'Từ ô ăn quan, đốt tre tới lớp học thân quen, nhiều game lấy chất liệu từ trò chơi dân gian và đời sống Việt.'],
    [ICONS.lock, 'Quyền riêng tư rõ ràng', 'Mỗi game có chính sách quyền riêng tư riêng, dễ tìm, viết bằng tiếng Việt.'],
  ].map(([icon, h, p]) => `<li class="feature"><span class="feature-icon">${icon}</span><h3>${h}</h3><p>${p}</p></li>`).join('');
  const faq = FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
  return layout({
    title: `${BRAND} — Chơi vui mỗi ngày | Game offline và online`,
    description,
    games,
    graph: [
      { '@type': 'Organization', '@id': `${SITE}/#org`, name: BRAND, url: SITE, logo: abs('/assets/vpn-games-mark.svg'), email: CONTACT },
      { '@type': 'WebSite', '@id': `${SITE}/#site`, name: BRAND, url: SITE, inLanguage: 'vi', publisher: { '@id': `${SITE}/#org` } },
      { '@type': 'ItemList', name: 'Danh sách game', itemListElement: visible.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/game/${g.slug}`, name: g.name })) },
      { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
    body: `<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">${BRAND}</p>
    <h1>Chơi vui<br><span class="grad">mỗi ngày.</span></h1>
    <p class="lead">Bộ sưu tập game của chúng tôi, từ puzzle offline tới chiến thuật online. Chọn một game để tải về, xem hình ảnh và đọc chính sách quyền riêng tư.</p>
    <p class="cta"><a class="btn-hero" href="#games">Khám phá game</a><a class="btn-ghost" href="#gioi-thieu">Về ${BRAND}</a></p>
    <ul class="stats">
      <li><strong>${visible.length}</strong><span>game</span></li>
      <li><strong>${policies}</strong><span>chính sách riêng tư</span></li>
      ${soon ? `<li><strong>${soon}</strong><span>đang phát triển</span></li>` : ''}
    </ul>
  </div>
  <div class="hero-art" aria-hidden="true">${floaters}</div>
</section>

<section class="section" id="games" aria-labelledby="games-h">
  <div class="section-head"><h2 id="games-h">Tất cả game</h2><p>Mỗi game có trang riêng với link tải, hình ảnh và chính sách quyền riêng tư.</p></div>
  <div class="grid">
${cards}
  </div>
</section>

<section class="section" id="gioi-thieu" aria-labelledby="about-h">
  <div class="section-head"><h2 id="about-h">Giới thiệu ${BRAND}</h2></div>
  <p class="about-text">${BRAND} là bộ sưu tập game di động và web do chúng tôi tự phát triển, từ puzzle bằng bút chì tới chiến thuật theo lượt. Nhiều game lấy cảm hứng từ trò chơi dân gian và đời sống Việt Nam. Mỗi game có một trang riêng với link tải, hình ảnh và chính sách quyền riêng tư rõ ràng.</p>
  <ul class="features">${features}</ul>
</section>

<section class="section" id="hoi-dap" aria-labelledby="faq-h">
  <div class="section-head"><h2 id="faq-h">Câu hỏi thường gặp</h2></div>
  <div class="faq">
${faq}
  </div>
</section>`,
  });
}

/** Trang chi tiết: link tải, hình ảnh, thông tin, giới thiệu và chính sách của một game. */
export function gamePage(g, games = []) {
  const downloads = downloadButtons(g);
  const shots = (g.screenshots || []).filter(isUrl);
  const paragraphs = String(g.description || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  const dlSection = downloads
    ? `<div class="dl-grid">${downloads}</div>`
    : `<p class="empty">${g.comingSoon ? 'Game đang được phát triển, link tải sẽ sớm có.' : 'Chưa có link tải cho game này.'}</p>`;
  const plats = platforms(g);
  const facts = [
    ['Nhà phát triển', BRAND],
    ['Nền tảng', plats.length ? plats.join(', ') : 'Đang cập nhật'],
    ['Trạng thái', status(g)],
    g.updatedAt ? ['Cập nhật', viDate(g.updatedAt)] : null,
    hasPrivacy(g) ? ['Quyền riêng tư', `<a href="/privacy/${esc(g.slug)}">Xem chính sách</a>`, true] : null,
    ['Liên hệ', `<a href="mailto:${CONTACT}">${CONTACT}</a>`, true],
  ].filter(Boolean).map(([k, v, raw]) => `<div><dt>${k}</dt><dd>${raw ? v : esc(v)}</dd></div>`).join('');
  const others = shown(games).filter((o) => o.slug !== g.slug).slice(0, 3);
  const url = `${SITE}/game/${g.slug}`;
  const title = `${g.name}${g.subtitle ? ` · ${g.subtitle}` : ''} | ${BRAND}`;
  return layout({
    title,
    description: clip([g.tagline, g.description].filter(Boolean).join(' ')),
    path: `/game/${g.slug}`,
    image: g.icon,
    games,
    graph: [
      {
        '@type': 'VideoGame',
        name: g.name,
        ...(g.subtitle && { alternateName: g.subtitle }),
        description: clip([g.tagline, g.description].filter(Boolean).join(' '), 300),
        url,
        ...(g.icon && { image: abs(g.icon) }),
        ...(plats.length && { gamePlatform: plats }),
        inLanguage: 'vi',
        publisher: { '@type': 'Organization', name: BRAND, url: SITE },
        ...(g.updatedAt && { dateModified: g.updatedAt }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Game', item: `${SITE}/#games` },
          { '@type': 'ListItem', position: 3, name: g.name, item: url },
        ],
      },
    ],
    body: `<article class="game">
  <nav class="crumb" aria-label="Breadcrumb"><a href="/">${BRAND}</a><span aria-hidden="true">/</span><a href="/#games">Game</a><span aria-hidden="true">/</span><span aria-current="page">${esc(g.name)}</span></nav>
  <header class="game-head">
    ${iconImg(g, 120, 'game-icon', { alt: `Biểu tượng ${g.name}`, eager: true })}
    <div>
      <h1>${esc(g.name)}</h1>
      ${g.subtitle ? `<p class="sub">${esc(g.subtitle)}</p>` : ''}
      <p class="tagline">${esc(g.tagline)}</p>
      <p class="platforms">${platformTags(g)}</p>
    </div>
  </header>

  <section>
    <h2>Tải game</h2>
    ${dlSection}
  </section>
${shots.length ? `
  <section>
    <h2>Hình ảnh</h2>
    <div class="shots">${shots.map((s, i) => `<img src="${esc(s)}" alt="Ảnh chụp màn hình ${esc(g.name)} ${i + 1}" loading="lazy">`).join('')}</div>
  </section>` : ''}
${paragraphs ? `
  <section class="about">
    <h2>Giới thiệu ${esc(g.name)}</h2>
    ${paragraphs}
  </section>` : ''}

  <section>
    <h2>Thông tin</h2>
    <dl class="facts">${facts}</dl>
  </section>
${others.length ? `
  <section>
    <h2>Game khác của ${BRAND}</h2>
    <div class="grid">${others.map(gameCard).join('\n')}</div>
  </section>` : ''}
</article>`,
  });
}

export function policyIndexPage(games) {
  const items = shown(games)
    .filter(hasPrivacy)
    .map((g) => `<li><a href="/privacy/${esc(g.slug)}">${iconImg(g, 40, 'list-icon')}<span>${esc(g.name)}</span></a></li>`)
    .join('\n');
  return layout({
    title: `Chính sách quyền riêng tư | ${BRAND}`,
    description: `Chính sách quyền riêng tư của từng game ${BRAND}: dữ liệu nào được dùng, vì sao và cách liên hệ.`,
    path: '/privacy',
    games,
    body: `<article class="doc">
  <h1>Chính sách quyền riêng tư</h1>
  <p class="lead">Chọn game để xem chính sách quyền riêng tư tương ứng.</p>
  <ul class="list">
${items}
  </ul>
</article>`,
  });
}

/** Trang chính sách của một game. `privacy.html` do admin nhập, được coi là nội dung tin cậy. */
export function policyPage(g, updated, games = []) {
  return layout({
    title: `Quyền riêng tư — ${g.name} | ${BRAND}`,
    description: `Chính sách quyền riêng tư của ${g.name}.`,
    path: `/privacy/${g.slug}`,
    image: g.icon,
    games,
    body: `<article class="doc">
  <nav class="crumb" aria-label="Breadcrumb"><a href="/privacy">Chính sách quyền riêng tư</a><span aria-hidden="true">/</span><a href="/game/${esc(g.slug)}">${esc(g.name)}</a></nav>
  <h1>Chính sách quyền riêng tư — ${esc(g.name)}</h1>
  ${updated ? `<p class="meta">Cập nhật lần cuối: ${esc(updated)}</p>` : ''}
${g.privacy.html}
</article>`,
  });
}

export const robotsTxt = () => `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`;

/** Sitemap gồm trang chủ, trang chính sách, từng game và chính sách của game (chỉ link nội bộ). */
export function sitemapXml(games) {
  const urls = [{ loc: '/' }, { loc: '/privacy' }];
  for (const g of shown(games)) {
    const lastmod = g.updatedAt ? String(g.updatedAt).slice(0, 10) : '';
    urls.push({ loc: `/game/${g.slug}`, lastmod });
    if (g.privacy?.html) urls.push({ loc: `/privacy/${g.slug}`, lastmod });
    else if (g.privacy?.url?.startsWith('/')) urls.push({ loc: g.privacy.url, lastmod });
  }
  const items = urls.map((u) => `  <url><loc>${esc(SITE + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

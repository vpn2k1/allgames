// Sinh HTML cho trang chủ, trang chi tiết game và trang chính sách từ dữ liệu game.
export const CONTACT = 'vpnam2k1@gmail.com';

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isUrl = (u) => /^(https?:\/\/|\/)/.test(u || '');
const hasPrivacy = (g) => Boolean(g.privacy?.html || g.privacy?.url);

const ICONS = {
  download: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>',
  store: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 016 0"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>',
};

function layout({ title, description, body, image }) {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="theme-color" content="#342668">
<link rel="icon" type="image/svg+xml" href="/assets/vpn-games-mark.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="/"><img class="logo" src="/assets/vpn-games-mark.svg" alt="" width="28" height="28">VPN Games</a>
    <nav><a href="/">Game</a><a href="/privacy">Quyền riêng tư</a></nav>
  </div>
</header>
<main>
${body}
</main>
<footer>
  <div class="footer-inner">
    <p class="foot-brand">VPN Games</p>
    <p>Liên hệ: <a href="mailto:${CONTACT}">${CONTACT}</a></p>
    <p><a href="/privacy">Chính sách quyền riêng tư</a></p>
  </div>
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

function platformTags(g) {
  const l = g.links || {};
  const tags = [];
  if (l.androidApk || l.playStore) tags.push('Android');
  if (l.iosDirect || l.appStore) tags.push('iOS');
  if (l.web) tags.push('Web');
  const out = tags.map((t) => `<span class="tag">${t}</span>`);
  if (g.comingSoon) out.push('<span class="tag soon">Đang phát triển</span>');
  return out.join('');
}

const iconImg = (g, size, cls = '') =>
  g.icon
    ? `<img class="${cls}" src="${esc(g.icon)}" alt="" width="${size}" height="${size}" loading="lazy">`
    : `<div class="icon-placeholder ${cls}" style="width:${size}px;height:${size}px"></div>`;

function gameCard(g) {
  return `<article class="card">
  ${iconImg(g, 76, 'card-icon')}
  <div class="card-body">
    <h2><a class="card-link" href="/game/${esc(g.slug)}">${esc(g.name)}</a></h2>
    ${g.subtitle ? `<p class="sub">${esc(g.subtitle)}</p>` : ''}
    <p class="tagline">${esc(g.tagline)}</p>
    <p class="platforms">${platformTags(g)}</p>
  </div>
  <span class="more" aria-hidden="true">Xem chi tiết →</span>
</article>`;
}

export function indexPage(games) {
  const visible = games.filter((g) => g.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const cards = visible.length ? visible.map(gameCard).join('\n') : '<p class="empty">Chưa có game nào được hiển thị.</p>';
  return layout({
    title: 'VPN Games — Chơi vui mỗi ngày',
    description: 'Giới thiệu các game, link tải và chính sách quyền riêng tư của từng ứng dụng.',
    body: `<section class="hero">
  <h1 class="sr-only">VPN Games — Chơi vui mỗi ngày</h1>
  <img class="hero-banner" src="/assets/vpn-games-banner.svg" alt="" width="1600" height="600">
  <div class="hero-mobile" aria-hidden="true"><p class="eyebrow">VPN Games</p><p class="hero-mobile-title">Chơi vui<br><span class="grad">mỗi ngày.</span></p></div>
  <p class="lead">Bộ sưu tập game của chúng tôi, từ puzzle offline tới chiến thuật online. Chọn một game để tải về và xem chính sách quyền riêng tư.</p>
</section>
<section class="grid" aria-label="Danh sách game">
${cards}
</section>`,
  });
}

/** Trang chi tiết: link tải, hình ảnh, giới thiệu và chính sách của một game. */
export function gamePage(g) {
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
  return layout({
    title: `${g.name} — VPN Games`,
    description: g.tagline || g.description,
    image: g.icon,
    body: `<article class="game">
  <p class="crumb"><a href="/">← Tất cả game</a></p>
  <header class="game-head">
    ${iconImg(g, 120, 'game-icon')}
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
    <div class="shots">${shots.map((s) => `<img src="${esc(s)}" alt="Ảnh chụp màn hình ${esc(g.name)}" loading="lazy">`).join('')}</div>
  </section>` : ''}
${paragraphs ? `
  <section class="about">
    <h2>Giới thiệu</h2>
    ${paragraphs}
  </section>` : ''}
${hasPrivacy(g) ? `
  <section>
    <a class="pill" href="/privacy/${esc(g.slug)}">${ICONS.shield} Chính sách quyền riêng tư</a>
  </section>` : ''}
</article>`,
  });
}

export function policyIndexPage(games) {
  const items = games
    .filter((g) => g.visible && hasPrivacy(g))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((g) => `<li><a href="/privacy/${esc(g.slug)}">${iconImg(g, 40, 'list-icon')}<span>${esc(g.name)}</span></a></li>`)
    .join('\n');
  return layout({
    title: 'Chính sách quyền riêng tư — VPN Games',
    description: 'Chính sách quyền riêng tư của các game.',
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
export function policyPage(g, updated) {
  return layout({
    title: `Quyền riêng tư — ${g.name}`,
    description: `Chính sách quyền riêng tư của ${g.name}.`,
    image: g.icon,
    body: `<article class="doc">
  <p class="crumb"><a href="/privacy">Chính sách quyền riêng tư</a> / <a href="/game/${esc(g.slug)}">${esc(g.name)}</a></p>
  <h1>Chính sách quyền riêng tư — ${esc(g.name)}</h1>
  ${updated ? `<p class="meta">Cập nhật lần cuối: ${esc(updated)}</p>` : ''}
${g.privacy.html}
</article>`,
  });
}

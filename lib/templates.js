const { formatDate } = require('./html-utils');

// Set via SITE_BASE when the site is deployed under a subpath (e.g. GitHub Pages
// project sites at https://user.github.io/repo/ need SITE_BASE=/repo).
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

function renderLayout({ title, description, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<script>${THEME_INIT_SCRIPT}</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description || ''}">
<link rel="stylesheet" href="${BASE}/css/style.css">
</head>
<body>
<header class="site-header">
  <a class="site-title" href="${BASE}/">My Blog</a>
  <button id="theme-toggle" type="button" aria-label="다크 모드 전환">
    <span class="icon-sun" aria-hidden="true">&#9728;&#65039;</span>
    <span class="icon-moon" aria-hidden="true">&#127769;</span>
  </button>
</header>
<main>
${bodyHtml}
</main>
<footer class="site-footer">
  <p>&copy; ${new Date().getFullYear()} My Blog</p>
</footer>
<script src="${BASE}/js/theme.js" defer></script>
</body>
</html>
`;
}

function renderPostCard({ title, date, slug, excerpt }) {
  return `<article class="post-card">
  <h2><a href="${BASE}/posts/${slug}.html">${title}</a></h2>
  <time datetime="${date}">${formatDate(date)}</time>
  <p>${excerpt}</p>
</article>`;
}

function renderAppCard({ name, title, description }) {
  const url = `${BASE}/apps/${name}/`;
  return `<article class="app-card">
  <div class="app-card-preview">
    <iframe src="${url}" loading="lazy" title="${title} 미리보기" scrolling="no" width="900" height="900"></iframe>
  </div>
  <div class="app-card-body">
    <h3><a href="${url}">${title}</a></h3>
    <p>${description}</p>
  </div>
</article>`;
}

function renderListPage({ posts, apps = [] }) {
  const cards = posts.map(renderPostCard).join('\n');
  const appsSection =
    apps.length > 0
      ? `<h1>미니 웹앱</h1>
<div class="app-grid">
${apps.map(renderAppCard).join('\n')}
</div>
`
      : '';
  return `${appsSection}<h1>글 목록</h1>
<div class="post-list">
${cards}
</div>`;
}

function renderPostPage({ title, date, contentHtml }) {
  return `<article class="post">
  <h1>${title}</h1>
  <time datetime="${date}">${formatDate(date)}</time>
  <div class="post-content">
${contentHtml}
  </div>
</article>`;
}

module.exports = { renderLayout, renderPostCard, renderAppCard, renderListPage, renderPostPage };

// Shared HTML shell for every page except the home page and resume (which are hand-written).
// Used at build time for the static pages in pages/ and at request time for /projects pages.
const { siteUrl } = require('../config');

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const PERSON = {
  name: 'Prajwal Sainju',
  email: 'sainjoprajol12@gmail.com',
  phone: '+977 9841273490',
  phoneHref: '+9779841273490',
  locality: 'Kathmandu',
  country: 'Nepal',
  linkedin: 'https://www.linkedin.com/in/prajwal-sainju/',
  github: 'https://github.com/sanjoprajol12',
};

const NAV = [
  { href: '/#about', label: 'About' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#experience', label: 'Experience' },
  { href: '/projects/', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
  { href: '/resume.html', label: 'Résumé' },
];

const LEGAL = [
  { href: '/privacy.html', label: 'Privacy policy' },
  { href: '/cookies.html', label: 'Cookie policy' },
  { href: '/terms.html', label: 'Terms of use' },
  { href: '/accessibility.html', label: 'Accessibility statement' },
];

function header(currentPath = '/') {
  const links = NAV.map(({ href, label }) => {
    const current = href === currentPath || (href === '/projects/' && currentPath.startsWith('/projects'));
    return `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a></li>`;
  }).join('');
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-nav">
    <nav class="nav-inner" aria-label="Main">
      <a href="/" class="nav-logo" aria-label="Prajwal Sainju, home">Prajwal <span>Sainju</span></a>
      <div class="nav-right">
        <ul class="nav-links" id="nav-links">${links}</ul>
        <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="Switch to light theme">
          <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        </button>
        <button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path class="menu-open" d="M3 6h18M3 12h18M3 18h18"/><path class="menu-close" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </nav>
  </header>`;
}

function footer() {
  const legal = LEGAL.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('');
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/" class="footer-logo">Prajwal <span>Sainju</span></a>
        <p class="footer-details">
          Frontend &amp; backend web developer<br />
          ${PERSON.locality}, ${PERSON.country}<br />
          <a href="mailto:${PERSON.email}">${PERSON.email}</a> ·
          <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>
        </p>
      </div>
      <nav aria-label="Site">
        <ul class="footer-links">
          <li><a href="/#about">About</a></li>
          <li><a href="/projects/">Projects</a></li>
          <li><a href="/resume.html">Résumé</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>
      <nav aria-label="Legal">
        <ul class="footer-links">${legal}
          <li><button type="button" class="link-btn" data-cookie-settings>Cookie settings</button></li>
        </ul>
      </nav>
    </div>
    <p class="footer-copy">© <span data-year>${new Date().getFullYear()}</span> ${PERSON.name}. All rights reserved.</p>
  </footer>`;
}

function breadcrumbHtml(items) {
  if (!items || items.length < 2) return '';
  const parts = items.map((item, i) => (i === items.length - 1
    ? `<li><span aria-current="page">${esc(item.name)}</span></li>`
    : `<li><a href="${item.path}">${esc(item.name)}</a></li>`)).join('');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${parts}</ol></nav>`;
}

function breadcrumbLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

// JSON inside <script> must not be able to close the tag
const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function renderPage({ path, title, description, body, breadcrumbs = [], jsonLd = [], noindex = false, ogType = 'website' }) {
  const url = `${siteUrl}${path}`;
  const graph = [...jsonLd];
  if (breadcrumbs.length > 1) graph.push(breadcrumbLd(breadcrumbs));
  const ld = graph.length ? `<script type="application/ld+json">${jsonForScript({ '@context': 'https://schema.org', '@graph': graph })}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  ${noindex ? '<meta name="robots" content="noindex, follow" />' : `<link rel="canonical" href="${esc(url)}" />`}
  <meta name="author" content="${PERSON.name}" />
  <meta name="theme-color" content="#0c0b09" />
  <meta name="color-scheme" content="dark light" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${PERSON.name}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:image" content="${siteUrl}/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Prajwal Sainju, frontend and backend developer in Kathmandu, Nepal" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${siteUrl}/images/og-image.jpg" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/css/fonts.css" />
  <link rel="stylesheet" href="/css/base.css" />
  <script src="/js/theme.js"></script>
  ${ld}
</head>
<body class="page">
${header(path)}
  <main id="main" class="page-main" tabindex="-1">
    <div class="container">
      ${breadcrumbHtml(breadcrumbs)}
      ${body}
    </div>
  </main>
${footer()}
  <script src="/js/site.js" defer></script>
</body>
</html>
`;
}

module.exports = { renderPage, esc, PERSON, header, footer, jsonForScript };

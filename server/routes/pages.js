// Server-rendered public pages that come from the database: one page per project, a project
// index, and the XML sitemap. Search engines get real HTML, and each project page links to
// related projects.
const express = require('express');
const wrap = require('../lib/asyncHandler');
const { loadContent } = require('./public');
const { slugify } = require('../lib/validate');
const { renderPage, esc, PERSON } = require('../views/layout');
const { siteUrl } = require('../config');

const router = express.Router();

// Pages at fixed addresses, listed in the sitemap alongside the project pages
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/projects/', priority: '0.8', changefreq: 'monthly' },
  { path: '/resume.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy.html', priority: '0.2', changefreq: 'yearly' },
  { path: '/cookies.html', priority: '0.2', changefreq: 'yearly' },
  { path: '/terms.html', priority: '0.2', changefreq: 'yearly' },
  { path: '/accessibility.html', priority: '0.2', changefreq: 'yearly' },
];

const slugOf = (project) => project.slug || slugify(project.title);
const safeUrl = (url) => (/^https?:\/\//i.test(url || '') ? url : '');

function setPageCache(res) {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.set('Netlify-CDN-Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
}

// `level` keeps the heading outline in order: h2 on the index, h3 under "Related projects"
function projectCard(project, level = 2) {
  const techs = (project.techs || []).slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('');
  return `
      <li class="project-row">
        <h${level} class="project-row-title"><a href="/projects/${esc(slugOf(project))}">${esc(project.title)}</a></h${level}>
        <p class="project-row-desc">${esc(project.description)}</p>
        <div class="chips">${techs}</div>
      </li>`;
}

// Projects sharing the most technologies, then by the order set in the admin
function relatedProjects(project, all) {
  const mine = new Set((project.techs || []).map((t) => t.toLowerCase()));
  return all
    .filter((p) => String(p._id) !== String(project._id))
    .map((p) => ({ p, shared: (p.techs || []).filter((t) => mine.has(t.toLowerCase())).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || (a.p.order || 0) - (b.p.order || 0))
    .slice(0, 3)
    .map(({ p }) => p);
}

router.get(['/projects', '/projects/'], wrap(async (req, res) => {
  if (req.path === '/projects') return res.redirect(301, '/projects/');
  const { projects } = await loadContent();
  setPageCache(res);
  res.send(renderPage({
    path: '/projects/',
    title: 'Projects by Prajwal Sainju | Laravel, Vue.js & TypeScript Work',
    description: `${projects.length} web projects built by Prajwal Sainju with Laravel, Vue.js, TypeScript and PHP, from live client platforms to developer tools.`,
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects/' }],
    jsonLd: [{
      '@type': 'CollectionPage',
      name: 'Projects by Prajwal Sainju',
      url: `${siteUrl}/projects/`,
      hasPart: projects.map((p) => ({ '@type': 'CreativeWork', name: p.title, url: `${siteUrl}/projects/${slugOf(p)}` })),
    }],
    body: `
      <h1 class="page-title">Projects</h1>
      <p class="page-lead">Web applications and tools I have built or contributed to. Each page explains what the project does and the technology behind it.</p>
      ${projects.length
    ? `<ul class="project-rows">${projects.map((p) => projectCard(p, 2)).join('')}</ul>`
    : '<p class="empty-state">No projects are published yet. <a href="/#contact">Get in touch</a> to hear about current work.</p>'}
    `,
  }));
}));

router.get('/projects/:slug', wrap(async (req, res, next) => {
  const { projects } = await loadContent();
  const slug = String(req.params.slug).toLowerCase();
  const project = projects.find((p) => slugOf(p) === slug);
  if (!project) return next(); // falls through to the 404 page

  const live = safeUrl(project.liveUrl);
  const source = safeUrl(project.githubUrl);
  const related = relatedProjects(project, projects);
  const techs = (project.techs || []).map((t) => `<li class="chip">${esc(t)}</li>`).join('');
  const features = (project.features || []).map((f) => `<li>${esc(f)}</li>`).join('');
  const title = `${project.title} | Project by Prajwal Sainju`;
  const description = (project.description || `${project.title}, a project by Prajwal Sainju.`).slice(0, 160);

  setPageCache(res);
  res.send(renderPage({
    path: `/projects/${slug}`,
    title,
    description,
    ogType: 'article',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects/' },
      { name: project.title, path: `/projects/${slug}` },
    ],
    jsonLd: [{
      '@type': source ? 'SoftwareSourceCode' : 'CreativeWork',
      name: project.title,
      description: project.description,
      url: `${siteUrl}/projects/${slug}`,
      author: { '@type': 'Person', name: PERSON.name, url: `${siteUrl}/` },
      keywords: (project.techs || []).join(', '),
      ...(source && { codeRepository: source }),
      ...(project.techs?.length && source && { programmingLanguage: project.techs }),
      ...(project.updatedAt && { dateModified: new Date(project.updatedAt).toISOString() }),
    }],
    body: `
      <article class="project-detail">
        <p class="eyebrow">${esc(project.statusKind === 'live' ? 'Live project' : project.statusLabel || 'Project')}</p>
        <h1 class="page-title">${esc(project.title)}</h1>
        <p class="page-lead">${esc(project.description)}</p>
        ${techs ? `<h2 class="section-h">Built with</h2><ul class="chips">${techs}</ul>` : ''}
        ${features ? `<h2 class="section-h">What it does</h2><ul class="plain-list">${features}</ul>` : ''}
        <div class="actions">
          ${live ? `<a class="btn btn-primary" href="${esc(live)}" target="_blank" rel="noopener" data-track="project_live_click" data-label="${esc(project.title)}">Visit the live site<span class="sr-only"> (opens in a new tab)</span></a>` : ''}
          ${source ? `<a class="btn btn-ghost" href="${esc(source)}" target="_blank" rel="noopener" data-track="project_source_click" data-label="${esc(project.title)}">View the source on GitHub<span class="sr-only"> (opens in a new tab)</span></a>` : ''}
          <a class="btn btn-ghost" href="/#contact">Ask me about this project</a>
        </div>
      </article>
      ${related.length ? `
      <section class="related" aria-labelledby="related-h">
        <h2 class="section-h" id="related-h">Related projects</h2>
        <ul class="project-rows">${related.map((p) => projectCard(p, 3)).join('')}</ul>
      </section>` : ''}
      <p class="back-link"><a href="/projects/">All projects</a></p>
    `,
  }));
}));

router.get('/sitemap.xml', wrap(async (_req, res) => {
  let projects = [];
  try {
    ({ projects } = await loadContent());
  } catch (err) {
    // Still list the fixed pages if the database is unreachable
    console.error(`[sitemap] ${err.message}`);
  }
  const entry = (path, { lastmod, changefreq, priority }) => `  <url>
    <loc>${esc(`${siteUrl}${path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : undefined);
  const newest = projects.reduce((max, p) => (p.updatedAt && new Date(p.updatedAt) > max ? new Date(p.updatedAt) : max), new Date(0));

  const urls = [
    ...STATIC_PAGES.map((page) => entry(page.path, { ...page, lastmod: page.path === '/projects/' && projects.length ? day(newest) : undefined })),
    ...projects.map((p) => entry(`/projects/${slugOf(p)}`, { lastmod: day(p.updatedAt), changefreq: 'monthly', priority: '0.6' })),
  ];
  res.type('application/xml');
  setPageCache(res);
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}));

module.exports = router;

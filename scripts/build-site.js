// Builds the public site into dist/, the only folder that is published.
//   - fills the shared header/footer into index.html and resume.html
//   - pre-renders the home page sections from the database (or the seed data when the
//     database is not reachable), so search engines and no-JS visitors see real content
//   - renders the content pages in pages/ with the shared layout
//   - minifies CSS and JavaScript, and copies fonts, images, icons and the admin build
// Usage: node scripts/build-site.js [--watch]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { siteUrl } = require('../server/config');
const { renderPage, header, footer } = require('../server/views/layout');
const render = require('../js/render');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const TEXT_FILES = /\.(html|txt|xml|webmanifest|json|svg)$/;

async function loadContent() {
  const seedData = require('../server/seed');
  const fallback = {
    site: seedData.siteSeed,
    skills: seedData.skillsSeed,
    experience: seedData.experienceSeed,
    projects: seedData.projectsSeed,
  };
  if (!process.env.MONGODB_URI || process.env.BUILD_FROM_SEED) return { ...fallback, source: 'seed data' };

  const mongoose = require('mongoose');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const [site, skills, experience, projects] = await Promise.all([
      mongoose.connection.collection('sites').findOne(),
      mongoose.connection.collection('skills').find().sort({ order: 1 }).toArray(),
      mongoose.connection.collection('experiences').find().sort({ order: 1 }).toArray(),
      mongoose.connection.collection('projects').find().sort({ order: 1 }).toArray(),
    ]);
    if (!site) return { ...fallback, source: 'seed data (database is empty)' };
    return { site, skills, experience, projects, source: 'database' };
  } catch (err) {
    console.warn(`Could not read the database (${err.message}); using seed data for the pre-rendered content.`);
    return { ...fallback, source: 'seed data' };
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

const withSiteUrl = (text) => text.replace(/__SITE_URL__/g, siteUrl);

// Conservative HTML minification: drops comments and indentation only
function minifyHtml(html) {
  return html
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .split('\n').map((line) => line.trim()).filter(Boolean).join('\n');
}

function write(relPath, content) {
  const file = path.join(dist, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copyDir(from, to, { transformText = false } = {}) {
  if (!fs.existsSync(from)) return;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest, { transformText });
    else {
      fs.mkdirSync(to, { recursive: true });
      if (transformText && TEXT_FILES.test(entry.name)) fs.writeFileSync(dest, withSiteUrl(fs.readFileSync(src, 'utf8')));
      else fs.copyFileSync(src, dest);
    }
  }
}

function fillPage(file, currentPath, sections = {}) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  html = html.replace('<!-- partial:header -->', header(currentPath)).replace('<!-- partial:footer -->', footer());
  html = html.replace(/<!-- render:(\w+) -->/g, (match, name) => (name in sections ? sections[name] : match));
  return minifyHtml(withSiteUrl(html));
}

async function build() {
  const started = Date.now();
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  const content = await loadContent();
  const site = content.site || {};
  write('index.html', fillPage('index.html', '/', {
    heroStats: render.heroStats(site.hero || {}),
    aboutText: render.aboutText(site.about || {}),
    aboutMeta: render.aboutMeta(site.about || {}),
    skills: render.skills(content.skills),
    experience: render.experience(content.experience),
    projects: render.projects(content.projects),
  }));
  write('resume.html', fillPage('resume.html', '/resume.html'));

  for (const file of fs.readdirSync(path.join(root, 'pages')).filter((f) => f.endsWith('.js'))) {
    const modulePath = path.join(root, 'pages', file);
    delete require.cache[modulePath];
    const page = require(modulePath);
    write(page.path, minifyHtml(renderPage(page)));
  }

  await esbuild.build({
    entryPoints: ['css/fonts.css', 'css/base.css', 'css/home.css', 'js/theme.js', 'js/site.js', 'js/render.js', 'js/portfolio.js', 'js/resume.js']
      .map((f) => path.join(root, f)),
    outbase: root,
    outdir: dist,
    minify: true,
    target: ['es2020', 'chrome100', 'safari15', 'firefox100'],
    logLevel: 'warning',
  });

  copyDir(path.join(root, 'fonts'), path.join(dist, 'fonts'));
  copyDir(path.join(root, 'images'), path.join(dist, 'images'));
  copyDir(path.join(root, 'public'), dist, { transformText: true });
  fs.copyFileSync(path.join(root, 'PrajwalSainju.pdf'), path.join(dist, 'PrajwalSainju.pdf'));
  copyDir(path.join(root, 'admin'), path.join(dist, 'admin'));
  if (!fs.existsSync(path.join(dist, 'admin', 'index.html'))) {
    console.warn('The admin is not built yet (admin/ is missing). Run `npm run build` to include it.');
  }

  console.log(`Built dist/ in ${Date.now() - started} ms (content from ${content.source}, site URL ${siteUrl})`);
}

build().then(() => {
  if (!process.argv.includes('--watch')) return;
  // Rebuild when a source file changes (used by `npm run dev`)
  let timer = null;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((err) => console.error(err.message)), 150);
  };
  ['index.html', 'resume.html', 'css', 'js', 'pages', 'public', 'images'].forEach((p) => {
    fs.watch(path.join(root, p), { recursive: true }, rebuild);
  });
  console.log('Watching for changes...');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

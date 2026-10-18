// Finds broken links in the built site (run `npm run build:site` first).
// Internal links must point at a built file or a server route; external links are requested.
// Usage: npm run check:links [-- --internal-only]
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const internalOnly = process.argv.includes('--internal-only');
// Served by the API function rather than as files
const DYNAMIC = [/^\/api\//, /^\/projects\/?/, /^\/sitemap\.xml$/, /^\/admin(\/|$)/];

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'admin' ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

function linksIn(html) {
  const links = new Set();
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) links.add(match[1].replace(/&amp;/g, '&'));
  for (const match of html.matchAll(/\ssrcset="([^"]+)"/g)) match[1].split(',').forEach((part) => links.add(part.trim().split(' ')[0]));
  return [...links];
}

function internalExists(url, ids) {
  const [pathname, hash] = url.split('#');
  if (!pathname) return !hash || ids.has(hash);
  if (DYNAMIC.some((re) => re.test(pathname))) return true;
  const file = path.join(dist, decodeURIComponent(pathname));
  return fs.existsSync(file) && (fs.statSync(file).isFile() || fs.existsSync(path.join(file, 'index.html')));
}

async function checkExternal(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) });
    if (res.status === 405 || res.status === 403) res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
    return res.status;
  } catch (err) {
    return err.name === 'TimeoutError' ? 'timeout' : err.message;
  }
}

async function main() {
  if (!fs.existsSync(dist)) throw new Error('dist/ is missing. Run `npm run build:site` first.');
  const problems = [];
  const external = new Map();
  const homeIds = new Set([...fs.readFileSync(path.join(dist, 'index.html'), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  for (const file of htmlFiles(dist)) {
    const page = path.relative(dist, file);
    const html = fs.readFileSync(file, 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const url of linksIn(html)) {
      if (/^(mailto|tel|data|javascript):/i.test(url)) continue;
      if (/^https?:\/\//i.test(url)) {
        if (/localhost|__SITE_URL__/.test(url)) continue;
        if (!external.has(url)) external.set(url, []);
        external.get(url).push(page);
      } else if (url.startsWith('/') || url.startsWith('#')) {
        // "/#contact" points at a section of the home page
        const ok = url.startsWith('/#') ? homeIds.has(url.slice(2)) : internalExists(url, ids);
        if (!ok) problems.push(`${page}: broken internal link ${url}`);
      }
    }
  }

  if (!internalOnly) {
    for (const [url, pages] of external) {
      const status = await checkExternal(url);
      // LinkedIn answers automated requests with 999; that is not a broken link
      if (status === 999) continue;
      if (typeof status !== 'number' || status >= 400) problems.push(`${status}: ${url} (on ${[...new Set(pages)].join(', ')})`);
    }
  }

  if (problems.length) {
    console.log(problems.join('\n'));
    console.log(`\n${problems.length} broken link(s)`);
    process.exitCode = 1;
  } else {
    console.log(`No broken links (${external.size} external link(s) checked${internalOnly ? ', skipped' : ''}).`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});

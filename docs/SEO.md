# Search, AI answers and local SEO

What the code already does, and the tasks that need your accounts or ongoing effort.

## Already in the site

| Area | What is done | Where |
| --- | --- | --- |
| Title tags and meta descriptions | Unique per page, long-tail and local ("Laravel & Vue.js Developer in Kathmandu, Nepal") | `index.html`, `pages/*.js`, `server/routes/pages.js` |
| Canonical tags | Every indexable page; thank-you and 404 are `noindex` | same |
| Open Graph and Twitter cards | Title, description, 1200×630 image (`images/og-image.jpg`) | same |
| Schema.org | Person, WebSite, ProfilePage, FAQPage, BreadcrumbList, CollectionPage, SoftwareSourceCode | JSON-LD in each page |
| XML sitemap | Generated from the database with last-modified dates | `/sitemap.xml` |
| robots.txt | Allows the site, blocks `/admin/` and `/api/`, points to the sitemap | `public/robots.txt` |
| llms.txt | Plain summary and key links for AI assistants | `public/llms.txt` |
| Programmatic pages | One page per project at `/projects/<slug>`, built from the admin data | `server/routes/pages.js` |
| Internal linking | Home → project pages; each project → related projects (shared tech); breadcrumbs; footer links | same |
| Answer-first content (AEO) | FAQ section with short direct answers, marked up as FAQPage | `index.html` |
| Crawlable content | The home page ships real content in HTML (pre-rendered at build), not only via JavaScript | `scripts/build-site.js` |
| Speed | Self-hosted fonts, WebP images with sizes, minified CSS/JS, deferred scripts, CDN caching | `dist/`, `netlify.toml` |

## Tasks for you

1. **Google Search Console**: add the site (DNS verification), submit `https://<your-domain>/sitemap.xml`, check Page indexing monthly.
2. **Bing Webmaster Tools**: sign in at bing.com/webmasters and choose "Import from Google Search Console" (no code needed), then submit the sitemap. Bing also feeds ChatGPT search and Copilot answers.
3. **Google Business Profile (GBP)**: only if you offer freelance services from Kathmandu. It requires a real service area and verification; do not create one for a job-seeker portfolio.
4. **Fix broken links**: these repositories return 404 (private or deleted): `anilshr25/consultancy-web`, `sanjoprajol12/Map-Dev-option`, `sanjoprajol12/Bingo`. Make them public or clear the GitHub URL in the admin. Run `npm run check:links` after changes.
5. **Remove em dashes and old claims from live content**: the seed was updated, but the live database still has the old text. Edit it in the admin (hero description, project titles, "9+ Projects" stat).

## Ongoing work

- **E-E-A-T (experience, expertise, authority, trust)**: write each project page from first-hand experience: your role, a problem you solved, a result. Say clearly when a project was team or employer work. Keep the résumé and the site consistent (the résumé says "Full Stack Developer Intern", the site says "Frontend & Backend Developer Intern"; pick one).
- **Search intent**: someone searching "Laravel developer Kathmandu" wants to hire. The hero, FAQ and contact form answer that. Someone searching a project name wants details, which is what project pages are for.
- **Short-tail vs long-tail keywords**: "Laravel developer" is very competitive; "Laravel and Vue.js developer in Kathmandu" or "Vue TypeScript admin dashboard developer Nepal" are realistic. Use them naturally in titles and first sentences, not as lists.
- **Keyword cannibalisation**: keep one page per topic. The home page targets your name and role; each project page targets that project. Do not create several pages about the same thing.
- **Topical authority and semantic SEO**: a few short write-ups (for example "How I structured a Laravel + Vue monolith") build relevance for your stack. Link them from the related project pages.
- **Featured snippets / AEO / GEO / LLMO**: start answers with a direct one-sentence answer, then detail. Keep facts (name, role, location, stack, contact) identical everywhere: site, llms.txt, LinkedIn, GitHub. AI assistants trust consistent facts.
- **Backlinks**: link the site from your GitHub profile README, LinkedIn "Featured", each project repository's README, and your college or employer pages if allowed. Avoid paid link schemes.
- **Content refreshing and pruning**: review every 3 to 6 months. Update dates and stats, remove projects you no longer want to show (deleting one removes its page and sitemap entry automatically).
- **Crawl budget**: small site, so not an issue. `/admin` and `/api` are already excluded.
- **Lighthouse**: run Chrome DevTools → Lighthouse on the deployed URL after each larger change.

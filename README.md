# My Portfolio

Portfolio site with a MongoDB-backed admin portal. Edit hero, about, skills, experience, projects, and contact details in the browser. Visitor messages from the contact form show up in admin and are emailed to you.

## Run locally

1. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI, a random `JWT_SECRET`, admin username and a strong admin password.
2. Allow your current IP in Atlas: Network Access → Add IP Address.
3. Install, build and start:

```bash
npm install
npm run build
npm start
```

`npm run build` compiles the Vue admin in `admin-ui/` and the public site into `dist/`, which is the only folder that is served. While working on the public site, `npm run dev` rebuilds on every change and restarts the server. While working on the admin, `npm run dev:admin` serves it with hot reload at http://localhost:4010/admin/ and forwards API calls to the server on port 3000.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`. These only create the first account (a super admin) when the database has no admin users yet. Every admin must turn on two-step verification before editing (`REQUIRE_MFA`). Add an email address on **My account** so you can use "Forgot password?".

The first start seeds the database with your current portfolio content if it is empty. To reset content from the seed file:

```bash
npm run seed -- --force
```

## How it fits together

| Part | Where |
| --- | --- |
| Public pages | `index.html`, `resume.html`, `pages/*.js` (privacy, cookies, terms, accessibility, 404, thank-you) |
| Styles and scripts | `css/`, `js/` (minified into `dist/` by `scripts/build-site.js`) |
| Project pages, sitemap | `server/routes/pages.js` (`/projects/<slug>`, `/sitemap.xml`) |
| API | `server/app.js` and `server/routes/` |
| Emails and alerts | queued in MongoDB (`server/lib/queue.js`), sent by a worker every minute (server) or 5 minutes (Netlify scheduled function) |
| Admin | `admin-ui/` (Vue + Vuetify) |

## Security

- Admin sessions are httpOnly, SameSite=Strict cookies with CSRF protection, valid for 12 hours.
- Passwords are hashed with bcrypt (cost 12) and must be 8+ characters; two-step verification is required.
- Sign-in is rate limited per network and per account, and repeated failures send a security alert.
- Password reset links expire after 30 minutes and work once.
- Security headers (CSP, HSTS, frame blocking) are set by the API and in `netlify.toml`.
- Request bodies are stripped of MongoDB operators, and admin writes only accept known fields.

## Maintenance

```bash
npm run backup        # saves every collection to backups/<date>/ (keeps the newest 14)
npm run check:links   # finds broken links in the built site
```

Schedule `npm run backup` (cron or a CI job) for automatic backups, and store the files somewhere private: they contain password hashes. MongoDB Atlas paid tiers also offer automatic snapshots.

## Deploy

This app needs Node.js 20.19 or newer. On Netlify, `netlify.toml` builds everything and publishes `dist/`; set the variables from `.env.example` under Site configuration → Environment variables. On Render, Railway, or a VPS, use `npm install && npm run build` as the build command and `npm start` to run it.

Never commit `.env`. If a database password or secret was ever committed or shared, rotate it in Atlas and generate a new `JWT_SECRET`.

See [docs/SEO.md](docs/SEO.md) for search, AI-answer and local SEO tasks that need your accounts.

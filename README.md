# My Portfolio

Portfolio site with a MongoDB-backed admin portal. Edit hero, about, skills, experience, projects, and contact details in the browser. Visitor messages from the contact form show up in admin.

## Run locally

1. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI, admin username, and admin password.
2. Allow your current IP in Atlas: Network Access → Add IP Address.
3. Install, build the admin, and start:

```bash
npm install
npm run build
npm start
```

`npm run build` compiles the Vue admin in `admin-ui/` into `admin/`. Run it again after changing anything in `admin-ui/`. While working on the admin, `npm run dev:admin` serves it with hot reload at http://localhost:4010/admin/ and forwards API calls to the server on port 3000.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`. These only create the first account (a super admin) when the database has no admin users yet. After that, change passwords, add admins and turn on two-step verification under **Administration** in the admin portal; editing `.env` no longer resets a password.

The first start seeds the database with your current portfolio content if it is empty. To reset content from the seed file:

```bash
npm run seed -- --force
```

## What you can change in admin

- Hero, name, photo, stats, footer
- About paragraphs and sidebar rows
- Skill categories and tags
- Work experience
- Projects (add, edit, delete)
- Contact email, phone, social links
- Incoming contact messages (mark read, reply, delete)

Saves update the live site immediately. You do not need to edit HTML to change copy.

## Deploy

This app needs Node.js 20.19 or newer (not GitHub Pages). On Netlify, `netlify.toml` already runs `npm run build`. On Render, Railway, or a VPS, use `npm install && npm run build` as the build command and `npm start` to run it, set the same `.env` values there, and keep `/admin` private by using a strong password.

Never commit `.env`. If a database password was shared in chat or a screenshot, rotate it in Atlas.

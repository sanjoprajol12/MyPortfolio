# My Portfolio

Portfolio site with a MongoDB-backed admin portal. Edit hero, about, skills, experience, projects, and contact details in the browser. Visitor messages from the contact form show up in admin.

## Run locally

1. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI, admin username, and admin password.
2. Allow your current IP in Atlas: Network Access → Add IP Address.
3. Install and start:

```bash
npm install
npm start
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.

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

This app needs Node.js (not GitHub Pages). Host it on Render, Railway, or any VPS, set the same `.env` values there, and keep `/admin` private by using a strong password.

Never commit `.env`. If a database password was shared in chat or a screenshot, rotate it in Atlas.

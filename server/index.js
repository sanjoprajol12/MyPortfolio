require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDb } = require('./db');
const { seed } = require('./seed');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const mfaRoutes = require('./routes/mfa');
const userRoutes = require('./routes/users');

const app = express();
const root = path.join(__dirname, '..');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(root, 'uploads')));
app.use('/admin', express.static(path.join(root, 'admin')));
app.use('/images', express.static(path.join(root, 'images')));
app.use('/js', express.static(path.join(root, 'js')));

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin/mfa', mfaRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin', adminRoutes);

// The admin is a Vue single-page app built into admin/ (see admin-ui/). Its client-side
// routes such as /admin/projects all load the same index.html.
app.get(['/admin', '/admin/*'], (_req, res) => {
  res.sendFile(path.join(root, 'admin', 'index.html'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

// Root-level pages and files linked from the site (Netlify serves these statically)
app.get('/resume.html', (_req, res) => {
  res.sendFile(path.join(root, 'resume.html'));
});

app.get('/PrajwalSainju.pdf', (_req, res) => {
  res.sendFile(path.join(root, 'PrajwalSainju.pdf'));
});

const port = Number(process.env.PORT) || 3000;

connectDb()
  .then(() => seed())
  .then(() => {
    app.listen(port, () => {
      console.log(`Portfolio running at http://localhost:${port}`);
      console.log(`Admin portal at http://localhost:${port}/admin`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });

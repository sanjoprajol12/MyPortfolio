require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDb } = require('./db');
const { seed } = require('./seed');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

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
app.use('/api/admin', adminRoutes);

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(root, 'admin', 'index.html'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(root, 'index.html'));
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

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Site = require('../models/Site');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `photo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.get('/overview', async (_req, res) => {
  const [unread, totalMessages, projects, experience] = await Promise.all([
    Message.countDocuments({ read: false }),
    Message.countDocuments(),
    Project.countDocuments(),
    Experience.countDocuments(),
  ]);
  res.json({ unread, totalMessages, projects, experience });
});

router.get('/site', async (_req, res) => {
  const site = await Site.findOne();
  res.json(site);
});

router.put('/site', async (req, res) => {
  const payload = { ...req.body };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  const site = await Site.findOneAndUpdate({}, payload, { new: true, upsert: true });
  res.json(site);
});

router.post('/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const photoUrl = `/uploads/${req.file.filename}`;
  await Site.findOneAndUpdate({}, { 'hero.photoUrl': photoUrl }, { upsert: true });
  res.json({ photoUrl });
});

router.get('/skills', async (_req, res) => {
  res.json(await Skill.find().sort({ order: 1 }));
});

router.post('/skills', async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json(skill);
});

router.put('/skills/:id', async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!skill) return res.status(404).json({ error: 'Not found' });
  res.json(skill);
});

router.delete('/skills/:id', async (req, res) => {
  await Skill.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/experience', async (_req, res) => {
  res.json(await Experience.find().sort({ order: 1 }));
});

router.post('/experience', async (req, res) => {
  const item = await Experience.create(req.body);
  res.status(201).json(item);
});

router.put('/experience/:id', async (req, res) => {
  const item = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/experience/:id', async (req, res) => {
  await Experience.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/projects', async (_req, res) => {
  res.json(await Project.find().sort({ order: 1 }));
});

router.post('/projects', async (req, res) => {
  const item = await Project.create(req.body);
  res.status(201).json(item);
});

router.put('/projects/:id', async (req, res) => {
  const item = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/messages', async (_req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }));
});

router.patch('/messages/:id/read', async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

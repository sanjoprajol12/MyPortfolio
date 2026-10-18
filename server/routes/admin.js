const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Site = require('../models/Site');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Message = require('../models/Message');
const { auth, requireMfaEnrolled } = require('../middleware/auth');
const wrap = require('../lib/asyncHandler');
const cache = require('../lib/cache');
const { pick } = require('../lib/validate');

const router = express.Router();
router.use(auth, requireMfaEnrolled);

// Any successful change clears the cached public content so the site shows it right away
router.use((req, res, next) => {
  if (req.method !== 'GET') res.on('finish', () => { if (res.statusCode < 400) cache.clear(); });
  next();
});

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Not found' });
  next();
});

// Fields an admin may set on each kind of document; anything else in the request is ignored
const FIELDS = {
  skill: ['order', 'title', 'subtitle', 'fullWidth', 'tags'],
  experience: ['order', 'date', 'role', 'company', 'stack', 'bullets'],
  project: ['order', 'title', 'slug', 'description', 'liveUrl', 'githubUrl', 'statusKind', 'statusLabel', 'techs', 'features'],
  site: ['firstName', 'lastName', 'pageTitle', 'metaDescription', 'hero', 'about', 'contact', 'resume', 'footerCopy'],
};

const UPDATE_OPTIONS = { new: true, runValidators: true };

// Memory storage works in serverless environments (no writable disk); the image is stored as a
// data URL in MongoDB. The admin resizes photos in the browser before uploading.
const IMAGE_SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_SIGNATURES[file.mimetype]) {
      return cb(Object.assign(new Error('Only JPEG, PNG or WebP images are allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

router.get('/overview', wrap(async (_req, res) => {
  const [unread, totalMessages, projects, experience] = await Promise.all([
    Message.countDocuments({ read: false, spam: { $ne: true } }),
    Message.countDocuments({ spam: { $ne: true } }),
    Project.estimatedDocumentCount(),
    Experience.estimatedDocumentCount(),
  ]);
  res.json({ unread, totalMessages, projects, experience });
}));

router.get('/site', wrap(async (_req, res) => {
  res.json(await Site.findOne());
}));

router.put('/site', wrap(async (req, res) => {
  const site = await Site.findOneAndUpdate({}, pick(req.body, FIELDS.site), { ...UPDATE_OPTIONS, upsert: true });
  res.json(site);
}));

router.post('/upload', upload.single('photo'), wrap(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // The declared type must match the file's actual contents
  if (!IMAGE_SIGNATURES[req.file.mimetype](req.file.buffer)) {
    return res.status(400).json({ error: 'The file is not a valid image' });
  }
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  await Site.findOneAndUpdate({}, { 'hero.photoUrl': dataUrl }, { upsert: true });
  res.json({ photoUrl: dataUrl });
}));

// Create/read/update/delete for an ordered collection
function crud(path, Model, fields) {
  router.get(`/${path}`, wrap(async (_req, res) => {
    res.json(await Model.find().sort({ order: 1 }));
  }));

  router.post(`/${path}`, wrap(async (req, res) => {
    res.status(201).json(await Model.create(pick(req.body, fields)));
  }));

  router.put(`/${path}/:id`, wrap(async (req, res) => {
    // Loaded and saved (not updated in place) so document hooks such as the project slug run
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.set(pick(req.body, fields));
    res.json(await item.save());
  }));

  router.delete(`/${path}/:id`, wrap(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));
}

crud('skills', Skill, FIELDS.skill);
crud('experience', Experience, FIELDS.experience);
crud('projects', Project, FIELDS.project);

// Paginated and searched on the server, so the inbox stays fast however many messages arrive
router.get('/messages', wrap(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const filter = {};
  if (req.query.status === 'spam') filter.spam = true;
  else {
    filter.spam = { $ne: true };
    if (req.query.status === 'unread') filter.read = false;
    if (req.query.status === 'read') filter.read = true;
  }
  const term = String(req.query.q || '').trim().slice(0, 100);
  if (term) {
    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { message: pattern }];
  }

  const [items, total, unread] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ read: false, spam: { $ne: true } }),
  ]);
  res.json({ items, total, unread, page, limit });
}));

router.patch('/messages/:id/read', wrap(async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}));

router.patch('/messages/:id/spam', wrap(async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, { spam: req.body.spam !== false }, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}));

router.delete('/messages/:id', wrap(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;

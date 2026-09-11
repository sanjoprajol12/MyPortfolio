const express = require('express');
const rateLimit = require('express-rate-limit');
const Site = require('../models/Site');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Message = require('../models/Message');

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Too many messages. Please try again later.' },
});

router.get('/content', async (_req, res) => {
  const [site, skills, experience, projects] = await Promise.all([
    Site.findOne().lean(),
    Skill.find().sort({ order: 1 }).lean(),
    Experience.find().sort({ order: 1 }).lean(),
    Project.find().sort({ order: 1 }).lean(),
  ]);
  res.json({ site, skills, experience, projects });
});

router.post('/messages', messageLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const message = String(req.body.message || '').trim();
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (name.length > 120 || email.length > 160 || message.length > 4000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }
  await Message.create({ name, email, message });
  res.status(201).json({ ok: true });
});

module.exports = router;

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDb } = require('./db');
const User = require('./models/User');
const Site = require('./models/Site');
const Skill = require('./models/Skill');
const Experience = require('./models/Experience');
const Project = require('./models/Project');

const siteSeed = {
  firstName: 'Prajwal',
  lastName: 'Sainju',
  pageTitle: 'Prajwal Sainju — Frontend & Backend Developer',
  hero: {
    eyebrow: 'Interning @ Futech ·',
    eyebrowHighlight: 'Laravel · Vue.js · TypeScript',
    headlineLine1: 'Frontend',
    headlineLine2: '& Backend',
    headlineLine3: 'Dev.',
    locationLabel: 'Based in Kathmandu, Nepal',
    description: 'I build clean, scalable web applications — from Laravel APIs and Blade-powered monoliths to reactive Vue + TypeScript frontends. Focused on maintainable code and reusable architecture on both sides of the stack.',
    photoUrl: 'images/profile.jpg',
    photoName: 'Prajwal Sainju',
    photoRole: 'Frontend & Backend Developer',
    stats: [
      { num: '9+', label: 'Projects', fullWidth: false },
      { num: '1', label: 'Live / Prod', fullWidth: false },
    ],
    primaryStack: ['Laravel', 'Vue.js', 'TypeScript', 'MySQL'],
  },
  about: {
    paragraphs: [
      "I'm a Frontend & Backend Developer based in **Kathmandu, Nepal**, building production web applications that are clean, performant, and maintainable — across both the server and the client.",
      "Currently interning at **Futech Solution**, where I ship features daily using **Laravel**, **Vue.js**, **TypeScript**, and **SCSS**. I'm comfortable in both patterns: decoupled Vue SPA + Laravel API setups and classic Laravel + Blade monoliths — choosing the right tool for the project at hand.",
      'I care deeply about **reusable components**, **type-safe code**, and **architectural clarity** — groundwork that makes future features a joy rather than a burden. I also follow professional Git workflows with code reviews.',
    ],
    meta: [
      { key: 'Location', value: 'Kathmandu, Nepal' },
      { key: 'Email', value: 'sainjoprajol12@gmail.com' },
      { key: 'Phone', value: '+977 9841273490' },
      { key: 'Education', value: 'BCA — Arunima College' },
      { key: 'Focus', value: 'Vue + TypeScript · Laravel' },
      { key: 'Status', value: 'Interning · Open to Work', highlight: true },
    ],
  },
  contact: {
    intro: "I'm always open to discussing new projects, opportunities, or ideas. Feel free to reach out directly or send a message below.",
    email: 'sainjoprajol12@gmail.com',
    phone: '+977 9841273490',
    availability: 'Currently interning & open to new opportunities',
    linkedinUrl: 'https://linkedin.com/in/prajwal-sainju/',
    linkedinHandle: 'in/prajwal-sainju',
    githubUrl: 'https://github.com/sanjoprajol12',
    githubHandle: 'github.com/sanjoprajol12',
  },
  footerCopy: '© 2026 · Kathmandu, Nepal · Built with care',
};

const skillsSeed = [
  {
    order: 1,
    title: 'Frontend',
    subtitle: '01 / Frontend',
    tags: [
      { name: 'Vue.js', highlight: true },
      { name: 'TypeScript', highlight: true },
      { name: 'JavaScript ES6+', highlight: true },
      { name: 'SCSS', highlight: true },
      { name: 'React.js' },
      { name: 'Inertia.js' },
      { name: 'Tailwind CSS' },
      { name: 'Bootstrap' },
      { name: 'HTML5' },
      { name: 'CSS3' },
    ],
  },
  {
    order: 2,
    title: 'Backend',
    subtitle: '02 / Backend',
    tags: [
      { name: 'Laravel', highlight: true },
      { name: 'PHP', highlight: true },
      { name: 'Blade', highlight: true },
      { name: 'MySQL', highlight: true },
      { name: 'PostgreSQL', highlight: true },
      { name: 'Node.js' },
      { name: 'Express.js' },
      { name: 'SQLite' },
      { name: 'MongoDB' },
      { name: 'SQL' },
      { name: 'C' },
      { name: 'C#' },
    ],
  },
  {
    order: 3,
    title: 'DevOps & Tooling',
    subtitle: '03 / Tooling',
    fullWidth: true,
    tags: [
      { name: 'Git', highlight: true },
      { name: 'GitHub', highlight: true },
      { name: 'GitLab' },
      { name: 'Composer' },
      { name: 'npm' },
      { name: 'Vite' },
      { name: 'VS Code' },
    ],
  },
];

const experienceSeed = [
  {
    order: 1,
    date: 'Dec 2025 — Present',
    role: 'Frontend & Backend Developer Intern',
    company: 'Futech Solution · Kathmandu, Nepal',
    stack: ['Laravel', 'Vue.js', 'TypeScript', 'Blade', 'MySQL'],
    bullets: [
      'Developed and maintained features across Laravel backends and Vue.js frontends for a live consultancy platform used in production.',
      'Built responsive admin dashboards with reusable Vue + TypeScript component architecture and SCSS theming.',
      'Developed RESTful APIs, authentication systems, role-based access control, and full CRUD workflows in Laravel.',
      'Worked in both decoupled SPA and Laravel Blade monolith architectures depending on project requirements.',
      'Collaborated via Git workflows and peer code reviews.',
    ],
  },
];

const projectsSeed = [
  {
    order: 1,
    title: 'Consultancy Web — Full-Stack Website',
    description: 'A public-facing consultancy platform combining server-rendered Blade pages for SEO with interactive Vue components. Hybrid architecture balancing crawlable content with a modern, responsive user experience.',
    liveUrl: 'https://applydirectedu.com/login',
    githubUrl: 'https://github.com/anilshr25/consultancy-web',
    statusKind: 'live',
    statusLabel: '● Live',
    techs: ['PHP', 'Vue', 'Blade', 'TypeScript'],
    features: [
      'Server-rendered Blade templates for SEO-optimized, fast-loading content',
      'Interactive Vue components integrated alongside Blade views',
      'Responsive service pages, contact forms, and marketing content',
    ],
  },
  {
    order: 2,
    title: 'Consultancy Admin — Dashboard',
    description: "An internal admin panel / operations dashboard for managing the consultancy's content, users, and records. Built with Vue + TypeScript for type safety and SCSS for a structured, scalable styling architecture.",
    liveUrl: 'https://portal.applydirectedu.com/login',
    githubUrl: 'https://github.com/anilshr25/consultancy-admin',
    statusKind: 'type',
    statusLabel: 'Admin Dashboard',
    techs: ['Vue.js', 'TypeScript', 'SCSS'],
    features: [
      'Fully component-driven UI with reusable building blocks',
      'TypeScript throughout — safer refactors and clearer data contracts',
      'SCSS architecture designed to scale across features',
      'Responsive layouts tuned for admin workflows',
    ],
  },
  {
    order: 3,
    title: 'Appointment System — Booking Platform',
    description: 'An end-to-end appointment booking and management platform covering full scheduling workflows for both users and admins.',
    githubUrl: 'https://github.com/karkirajendra/Apointment-System',
    statusKind: 'type',
    statusLabel: 'Scheduling Platform',
    techs: ['PHP', 'Blade', 'JavaScript'],
    features: [
      'Full booking workflow — scheduling, editing, and cancellation',
      'Auth system with separate admin and user views',
      'Appointment-first database design and schema',
    ],
  },
  {
    order: 4,
    title: 'Map Dev Option — World Guesser Helper',
    description: 'A developer-option / helper utility for a world guesser game, with interactive map-related behavior.',
    githubUrl: 'https://github.com/sanjoprajol12/Map-Dev-option',
    statusKind: 'type',
    statusLabel: 'Game Utility',
    techs: ['JavaScript', 'Vue', 'TypeScript'],
    features: ['Interactive map tooling for gameplay debugging', 'Vue + TypeScript component structure'],
  },
  {
    order: 5,
    title: 'Find Code Extension',
    description: 'A utility/extension-style project for code-related inspection and quick developer workflows.',
    githubUrl: 'https://github.com/sanjoprajol12/Find-code-extension',
    statusKind: 'type',
    statusLabel: 'Developer Tool',
    techs: ['JavaScript', 'HTML', 'CSS'],
    features: ['Lightweight code inspection tooling', 'Built for fast, everyday developer workflows'],
  },
  {
    order: 7,
    title: 'Sixth Sem Project',
    description: 'A semester academic project demonstrating application logic and interface implementation.',
    githubUrl: 'https://github.com/sanjoprajol12/sixthsem_project',
    statusKind: 'type',
    statusLabel: 'Academic Project',
    techs: ['JavaScript', 'CSS'],
    features: ['Core app logic implementation', 'Interface built from scratch for coursework'],
  },
  {
    order: 9,
    title: 'Bingo',
    description: 'An interactive Bingo game prototype focused on browser-based gameplay.',
    githubUrl: 'https://github.com/sanjoprajol12/Bingo',
    statusKind: 'type',
    statusLabel: 'Game Prototype',
    techs: [],
    features: ['Browser-based interactive gameplay'],
  },
];

async function seed({ force = false } = {}) {
  await connectDb();

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123';
  const passwordHash = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, new: true }
  );

  const hasSite = await Site.countDocuments();
  if (!hasSite || force) {
    if (force) {
      await Site.deleteMany({});
      await Skill.deleteMany({});
      await Experience.deleteMany({});
      await Project.deleteMany({});
    }
    await Site.create(siteSeed);
    await Skill.insertMany(skillsSeed);
    await Experience.insertMany(experienceSeed);
    await Project.insertMany(projectsSeed);
  }

  console.log('Seed complete.');
  console.log(`Admin login: ${username} / (password from .env ADMIN_PASSWORD)`);
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  seed({ force })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seed };

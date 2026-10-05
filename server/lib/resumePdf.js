const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const GOLD = '#8a6a1a';
const INK = '#1a1a28';
const MUTED = '#4a4a5c';
const RULE = '#d4d0c4';

function stripMd(text) {
  return String(text || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\s+/g, ' ').trim();
}

function fullName(site) {
  return [site.firstName, site.lastName].filter(Boolean).join(' ').trim() || 'Resume';
}

function slugName(site) {
  return fullName(site).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume';
}

function resolvePhoto(photoUrl) {
  if (!photoUrl || /^https?:\/\//i.test(photoUrl)) return null;
  const root = path.join(__dirname, '..', '..');
  const abs = path.join(root, String(photoUrl).replace(/^\//, ''));
  if (!fs.existsSync(abs)) return null;
  if (!/\.(jpe?g|png)$/i.test(abs)) return null;
  return abs;
}

function resumeData(site) {
  const r = site.resume || {};
  const hero = site.hero || {};
  const about = site.about || {};
  const contact = site.contact || {};
  const educationMeta = (about.meta || []).find((m) => /^education$/i.test(m.key || ''));
  return {
    headline: r.headline || hero.photoRole || 'Frontend & Backend Developer',
    summary: r.summary || hero.description || (about.paragraphs || []).map(stripMd).join(' '),
    location: r.location || hero.locationLabel || '',
    website: r.website || contact.website || '',
    includePhoto: Boolean(r.includePhoto),
    includeProjectsOnResume: Boolean(r.includeProjectsOnResume),
    resumeProjectLimit: Number(r.resumeProjectLimit) > 0 ? Number(r.resumeProjectLimit) : 3,
    education: (r.education || []).filter((e) => e.degree || e.school),
    fallbackEducation: educationMeta ? [{ degree: educationMeta.value, school: '', years: '', details: '' }] : [],
    certifications: (r.certifications || []).filter((c) => c.name),
    languages: (r.languages || []).filter((l) => l.name),
    awards: (r.awards || []).filter((a) => a.name),
    interests: r.interests || [],
    email: contact.email || '',
    phone: contact.phone || '',
    linkedin: contact.linkedinUrl || contact.linkedinHandle || '',
    github: contact.githubUrl || contact.githubHandle || '',
    photoUrl: hero.photoUrl || '',
  };
}

function section(doc, title) {
  doc.moveDown(0.55);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD).text(title.toUpperCase(), { characterSpacing: 1.2 });
  const y = doc.y + 2;
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).strokeColor(RULE).lineWidth(0.8).stroke();
  doc.moveDown(0.45);
  doc.fillColor(INK);
}

function ensureSpace(doc, needed = 70) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function buildPdf(res, { kind, site, skills, experience, projects }) {
  const isCv = kind === 'cv';
  const data = resumeData(site);
  const name = fullName(site);
  const filename = `${slugName(site)}-${isCv ? 'cv' : 'resume'}.pdf`;
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `${name} — ${isCv ? 'CV' : 'Resume'}`,
      Author: name,
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const photoPath = data.includePhoto ? resolvePhoto(data.photoUrl) : null;
  const textRight = photoPath ? right - 78 : right;

  doc.font('Helvetica-Bold').fontSize(22).fillColor(INK).text(name, left, doc.page.margins.top, { width: textRight - left });
  doc.font('Helvetica').fontSize(11).fillColor(GOLD).text(data.headline, { width: textRight - left });

  if (photoPath) {
    try {
      doc.image(photoPath, right - 68, doc.page.margins.top, { width: 68, height: 86, fit: [68, 86] });
    } catch {
      /* skip unreadable images */
    }
  }

  const bits = [data.location, data.email, data.phone, data.website, data.linkedin, data.github].filter(Boolean);
  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(bits.join('  ·  '), left, doc.y, { width: textRight - left });

  if (data.summary) {
    section(doc, 'Summary');
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(stripMd(data.summary), { align: 'left', lineGap: 2 });
  }

  if (experience && experience.length) {
    section(doc, 'Experience');
    experience.forEach((item) => {
      ensureSpace(doc, 64);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(item.role || '', { continued: false });
      const meta = [item.company, item.date].filter(Boolean).join('  ·  ');
      if (meta) doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(meta);
      const bullets = (item.bullets || []).slice(0, isCv ? 8 : 4);
      bullets.forEach((b) => {
        doc.font('Helvetica').fontSize(9).fillColor(INK).text(`•  ${stripMd(b)}`, { indent: 8, lineGap: 1.5 });
      });
      const stack = (item.stack || []).join(', ');
      if (stack && isCv) doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED).text(stack, { indent: 8 });
      doc.moveDown(0.35);
    });
  }

  if (skills && skills.length) {
    section(doc, 'Skills');
    skills.forEach((group) => {
      const tags = (group.tags || []).map((t) => t.name || t).filter(Boolean).join(', ');
      if (!tags) return;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(`${group.title || 'Skills'}: `, { continued: true });
      doc.font('Helvetica').fontSize(9).fillColor(INK).text(tags);
      doc.moveDown(0.12);
    });
  }

  const education = data.education.length ? data.education : data.fallbackEducation;
  if (education.length) {
    section(doc, 'Education');
    education.forEach((ed) => {
      ensureSpace(doc, 40);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(ed.degree || 'Education');
      const meta = [ed.school, ed.years].filter(Boolean).join('  ·  ');
      if (meta) doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(meta);
      if (ed.details) doc.font('Helvetica').fontSize(9).fillColor(INK).text(stripMd(ed.details));
      doc.moveDown(0.2);
    });
  }

  const showProjects = isCv || data.includeProjectsOnResume;
  const projectList = showProjects ? (projects || []).slice(0, isCv ? 12 : data.resumeProjectLimit) : [];
  if (projectList.length) {
    section(doc, 'Projects');
    projectList.forEach((p) => {
      ensureSpace(doc, 48);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(p.title || 'Project');
      if (p.description) doc.font('Helvetica').fontSize(9).fillColor(INK).text(stripMd(p.description), { lineGap: 1.5 });
      const techs = (p.techs || []).join(', ');
      if (techs) doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED).text(techs);
      if (isCv) {
        (p.features || []).slice(0, 3).forEach((f) => {
          doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(`•  ${stripMd(f)}`, { indent: 8 });
        });
      }
      doc.moveDown(0.25);
    });
  }

  if (data.certifications.length) {
    section(doc, 'Certifications');
    data.certifications.forEach((c) => {
      const line = [c.name, c.issuer, c.year].filter(Boolean).join('  ·  ');
      doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(`•  ${line}`);
    });
  }

  if (data.languages.length) {
    section(doc, 'Languages');
    const line = data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join('   ·   ');
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(line);
  }

  if (isCv && data.awards.length) {
    section(doc, 'Awards');
    data.awards.forEach((a) => {
      const line = [a.name, a.year].filter(Boolean).join('  ·  ');
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(INK).text(line);
      if (a.details) doc.font('Helvetica').fontSize(9).text(stripMd(a.details));
    });
  }

  if (isCv && data.interests.length) {
    section(doc, 'Interests');
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(data.interests.join(', '));
  }

  doc.end();
}

module.exports = { buildPdf, resumeData };

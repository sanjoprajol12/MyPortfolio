const nodemailer = require('nodemailer');
const { mail } = require('../config');

let transport = null;

function isMailConfigured() {
  return Boolean(mail.host && mail.from);
}

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.port === 465,
      requireTLS: mail.port !== 465,
      auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
      // Never read attachments or content from disk or URLs
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
  return transport;
}

// Header injection guard: one line, no control characters
const oneLine = (value) => String(value || '').replace(/[\r\n\t\0]+/g, ' ').trim().slice(0, 300);

async function sendMail({ to, subject, text, html, replyTo }) {
  if (!isMailConfigured()) {
    const err = new Error('Email is not configured (set SMTP_HOST and MAIL_FROM)');
    err.permanent = true;
    throw err;
  }
  await getTransport().sendMail({
    from: oneLine(mail.from),
    to: oneLine(to),
    subject: oneLine(subject),
    text,
    html,
    ...(replyTo && { replyTo: oneLine(replyTo) }),
  });
}

module.exports = { sendMail, isMailConfigured };

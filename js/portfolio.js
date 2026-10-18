// Home page: refreshes the content with the latest from the admin, and runs the contact form.
// The page already contains the content from the last build, so it works without this script.
(function () {
  const R = window.PortfolioRender;
  const $ = (id) => document.getElementById(id);
  const esc = R.esc;
  const startedAt = Date.now();

  function setHtml(id, html) {
    const el = $(id);
    if (el && html != null) el.innerHTML = html;
  }

  function setText(id, text) {
    const el = $(id);
    if (el && text) el.textContent = text;
  }

  function setLink(id, href) {
    const el = $(id);
    if (el && href) el.href = href;
  }

  function render(data) {
    const site = data.site || {};
    const hero = site.hero || {};
    const about = site.about || {};
    const contact = site.contact || {};
    const fullName = [site.firstName, site.lastName].filter(Boolean).join(' ');

    if (site.firstName || site.lastName) {
      document.querySelectorAll('.nav-logo, .footer-logo').forEach((el) => {
        el.innerHTML = `${esc(site.firstName || '')} <span>${esc(site.lastName || '')}</span>`;
      });
    }

    if (hero.eyebrow || hero.eyebrowHighlight) {
      setHtml('hero-eyebrow-text', `${esc(hero.eyebrow || '')} <span class="hi">${esc(hero.eyebrowHighlight || '')}</span>`);
    }
    if (hero.headlineLine1) {
      setHtml('hero-title-visual', [hero.headlineLine1, hero.headlineLine2, hero.headlineLine3]
        .map((line, i) => (line ? `<span class="word w${i + 1}"><span class="word-inner">${esc(line)}</span></span>` : ''))
        .filter(Boolean).join('<br />'));
      setText('hero-title-text', [fullName, hero.photoRole].filter(Boolean).join(', '));
    }
    setText('hero-location', hero.locationLabel);
    setText('hero-desc', hero.description);
    setText('lbl-name', hero.photoName || fullName);
    setText('lbl-role', hero.photoRole);

    // A photo uploaded in the admin replaces the built-in responsive images
    const photo = $('hero-photo');
    if (photo && hero.photoUrl && !/(^|\/)images\/profile\.jpg$/.test(hero.photoUrl)) {
      $('hero-picture')?.querySelectorAll('source').forEach((s) => s.remove());
      photo.removeAttribute('srcset');
      photo.src = hero.photoUrl;
    }
    if (photo && fullName) photo.alt = `Portrait of ${fullName}`;

    setHtml('hero-stats', R.heroStats(hero));
    if (about.paragraphs?.length) setHtml('about-text', R.aboutText(about));
    if (about.meta?.length) setHtml('about-sidebar', R.aboutMeta(about));
    setHtml('skills-grid', R.skills(data.skills));
    setHtml('timeline', R.experience(data.experience));
    setHtml('projects-list', R.projects(data.projects));

    setText('contact-intro', contact.intro);
    if (contact.email) {
      setLink('contact-email', `mailto:${contact.email}`);
      setText('contact-email-val', contact.email);
    }
    if (contact.phone) {
      setLink('contact-phone', `tel:${contact.phone.replace(/[^\d+]/g, '')}`);
      setText('contact-phone-val', contact.phone);
    }
    setText('avail-text', contact.availability);
    if (R.safeUrl(contact.linkedinUrl)) {
      setLink('social-linkedin', R.safeUrl(contact.linkedinUrl));
      setText('linkedin-handle', contact.linkedinHandle);
    }
    if (R.safeUrl(contact.githubUrl)) {
      setLink('social-github', R.safeUrl(contact.githubUrl));
      setText('github-handle', contact.githubHandle);
    }

    // Optional extra footer line from the admin; the copyright year is always the current one
    const note = String(site.footerCopy || '').replace(/^\s*©\s*\d{4}\s*[·|-]?\s*/, '').trim();
    const footerDetails = document.querySelector('.footer-details');
    if (note && footerDetails && !footerDetails.querySelector('[data-footer-note]')) {
      footerDetails.insertAdjacentHTML('beforeend', `<br /><span data-footer-note>${esc(note)}</span>`);
    }
  }

  const busy = ['skills-grid', 'timeline', 'projects-list'].map($).filter(Boolean);
  busy.forEach((el) => el.setAttribute('aria-busy', 'true'));
  fetch('/api/content', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(render)
    .catch(() => { /* keep the content that shipped with the page */ })
    .finally(() => busy.forEach((el) => el.removeAttribute('aria-busy')));

  // Hide a broken photo instead of showing the browser's broken-image icon
  $('hero-photo')?.addEventListener('error', () => {
    $('hero-picture').hidden = true;
    $('photo-placeholder').hidden = false;
  });

  // ── Contact form ───────────────────────────────────────────────────────────────────────────
  const form = $('contactForm');
  if (!form) return;
  const submitBtn = $('submitBtn');
  const status = $('formStatus');
  const fields = ['name', 'email', 'message', 'consent'];
  let turnstileWidget = null;

  function showStatus(kind, html) {
    status.className = `form-status form-status--${kind}`;
    status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    status.innerHTML = html;
    status.hidden = false;
  }

  function setFieldError(name, message) {
    const input = form.elements[name];
    const out = $(`${name}-error`);
    if (out) out.textContent = message || '';
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate() {
    const errors = {};
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    if (!name) errors.name = 'Please enter your name.';
    if (!email) errors.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address, like name@example.com.';
    if (!message) errors.message = 'Please write a message.';
    else if (message.length < 10) errors.message = 'Please write at least a sentence so I know how to help.';
    if (!form.elements.consent.checked) errors.consent = 'Please agree to the privacy policy so I can store and answer your message.';
    return errors;
  }

  function showErrors(errors) {
    fields.forEach((f) => setFieldError(f, errors[f]));
    const first = fields.find((f) => errors[f]);
    if (first) form.elements[first].focus();
  }

  // Re-check a field once the visitor has moved past it
  fields.forEach((name) => {
    const input = form.elements[name];
    input.addEventListener(name === 'consent' ? 'change' : 'blur', () => {
      if (input.getAttribute('aria-invalid') === 'true' || input.value) setFieldError(name, validate()[name]);
    });
  });

  // Cloudflare Turnstile, only when the site owner configured it
  window.pfSiteConfig?.().then((config) => {
    if (!config.turnstileSiteKey) return;
    window.onTurnstileLoad = () => {
      turnstileWidget = window.turnstile.render('#turnstile', { sitekey: config.turnstileSiteKey, theme: 'auto' });
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
    script.async = true;
    document.head.appendChild(script);
  });

  function setBusy(isBusy) {
    submitBtn.disabled = isBusy;
    submitBtn.setAttribute('aria-disabled', String(isBusy));
    submitBtn.textContent = isBusy ? 'Sending…' : 'Send message';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    const errors = validate();
    if (Object.keys(errors).length) {
      showErrors(errors);
      showStatus('error', 'Please fix the highlighted fields and try again.');
      return;
    }
    showErrors({});
    setBusy(true);

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      consent: form.elements.consent.checked,
      website: form.elements.website.value,
      elapsedMs: Date.now() - startedAt,
      turnstileToken: turnstileWidget !== null ? window.turnstile.getResponse(turnstileWidget) : undefined,
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body.fields) showErrors(body.fields);
        throw new Error(body.error || 'The message could not be sent.');
      }
      window.pfTrack?.('generate_lead', { method: 'contact_form' });
      showStatus('ok', 'Thank you, your message was sent. Taking you to the confirmation page…');
      form.reset();
      window.location.assign('/thank-you.html');
    } catch (err) {
      const email = $('contact-email-val')?.textContent || '';
      showStatus('error', `${esc(err.message === 'Failed to fetch' ? 'You seem to be offline.' : err.message)} You can also email me at <a href="mailto:${esc(email)}">${esc(email)}</a>.`);
      if (turnstileWidget !== null) window.turnstile.reset(turnstileWidget);
      setBusy(false);
    }
  });
}());

(function () {
  const API = window.PORTFOLIO_API || '';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function rich(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function bindHover() {
    document.querySelectorAll('a, button, .tag, .project-card, .skill-card').forEach((el) => {
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = '1';
      el.addEventListener('mouseenter', () => {
        document.getElementById('cursorDot')?.classList.add('hover');
        document.getElementById('cursorRing')?.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        document.getElementById('cursorDot')?.classList.remove('hover');
        document.getElementById('cursorRing')?.classList.remove('hover');
      });
    });
  }

  function render(data) {
    const site = data.site || {};
    const hero = site.hero || {};
    const about = site.about || {};
    const contact = site.contact || {};
    const fullName = [site.firstName, site.lastName].filter(Boolean).join(' ');

    if (site.pageTitle) document.title = site.pageTitle;

    document.querySelectorAll('[data-full-name]').forEach((el) => {
      el.innerHTML = `${esc(site.firstName || '')} <span>${esc(site.lastName || '')}</span>`;
    });

    const eyebrow = document.getElementById('hero-eyebrow-text');
    if (eyebrow) {
      eyebrow.innerHTML = `${esc(hero.eyebrow || '')} <span class="hi">${esc(hero.eyebrowHighlight || '')}</span>`;
    }

    const title = document.getElementById('hero-title');
    if (title) {
      title.innerHTML = `
        <span class="word w1"><span class="word-inner">${esc(hero.headlineLine1 || '')}</span></span><br/>
        <span class="word w2"><span class="word-inner">${esc(hero.headlineLine2 || '')}</span></span><br/>
        <span class="word w3"><span class="word-inner">${esc(hero.headlineLine3 || '')}</span></span>
      `;
    }

    const loc = document.getElementById('hero-location');
    if (loc) loc.textContent = hero.locationLabel || '';

    const desc = document.getElementById('hero-desc');
    if (desc) desc.textContent = hero.description || '';

    const photo = document.getElementById('hero-photo');
    if (photo && hero.photoUrl) {
      photo.src = hero.photoUrl;
      photo.alt = fullName;
    }

    const lblName = document.getElementById('lbl-name');
    if (lblName) lblName.textContent = hero.photoName || fullName;
    const lblRole = document.getElementById('lbl-role');
    if (lblRole) lblRole.textContent = hero.photoRole || '';

    const stats = document.getElementById('hero-stats');
    if (stats) {
      const statHtml = (hero.stats || []).map((s) => `
        <div class="hero-stat"${s.fullWidth ? ' style="grid-column:1/-1;"' : ''}>
          <div class="hero-stat-num">${esc(s.num || '')}</div>
          <div class="hero-stat-lbl">${esc(s.label || '')}</div>
        </div>
      `).join('');
      const stack = (hero.primaryStack || []).map((t) => `<span class="tag hi">${esc(t)}</span>`).join('');
      stats.innerHTML = `${statHtml}
        <div class="hero-stat" style="grid-column:1/-1;">
          <div class="hero-stat-lbl" style="margin-bottom:10px">Primary Stack</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap">${stack}</div>
        </div>`;
    }

    const aboutText = document.getElementById('about-text');
    if (aboutText) {
      aboutText.innerHTML = (about.paragraphs || []).map((p) => `<p>${rich(p)}</p>`).join('');
    }

    const aboutSide = document.getElementById('about-sidebar');
    if (aboutSide) {
      aboutSide.innerHTML = (about.meta || []).map((m) => `
        <div class="meta-row${m.highlight ? ' meta-row--highlight' : ''}">
          <div class="meta-key">${esc(m.key || '')}</div>
          <div class="meta-val">${esc(m.value || '')}</div>
        </div>
      `).join('');
    }

    const skillsGrid = document.getElementById('skills-grid');
    if (skillsGrid) {
      skillsGrid.innerHTML = (data.skills || []).map((s, i) => `
        <div class="skill-card"${s.fullWidth ? ' style="grid-column: 1 / -1;"' : ''}>
          <div class="skill-num">${esc(s.subtitle || `${pad(i + 1)} / ${s.title}`)}</div>
          <h3 class="skill-card-title">${esc(s.title || '')}</h3>
          <div class="tag-cloud">
            ${(s.tags || []).map((t) => `<span class="tag${t.highlight ? ' hi' : ''}">${esc(t.name || '')}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.innerHTML = (data.experience || []).map((item) => `
        <div class="timeline-item">
          <div class="timeline-date">${esc(item.date || '')}</div>
          <div class="timeline-role">${esc(item.role || '')}</div>
          <div class="timeline-company">${esc(item.company || '')}</div>
          <div class="timeline-stack">
            ${(item.stack || []).map((t) => `<span class="stack-badge">${esc(t)}</span>`).join('')}
          </div>
          <ul class="timeline-bullets">
            ${(item.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }

    const projects = document.getElementById('projects-list');
    if (projects) {
      projects.innerHTML = (data.projects || []).map((p, i) => {
        const click = p.liveUrl ? `onclick="window.open(${JSON.stringify(p.liveUrl)},'_blank')" style="cursor:pointer;"` : '';
        const status = p.statusKind === 'live'
          ? `<span class="proj-badge proj-badge-live">${esc(p.statusLabel || '● Live')}</span>`
          : p.statusKind === 'type' && p.statusLabel
            ? `<span class="proj-badge proj-badge-type">${esc(p.statusLabel)}</span>`
            : '';
        const gh = p.githubUrl ? `
          <a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-gh-btn" onclick="event.stopPropagation()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            GitHub
          </a>` : '';
        return `
          <article class="project-card" ${click}>
            <div class="project-num">${pad(i + 1)}</div>
            <div class="project-body">
              <div class="project-tags-row">
                ${status}
                ${(p.techs || []).map((t) => `<span class="proj-badge proj-badge-tech">${esc(t)}</span>`).join('')}
              </div>
              <h3 class="project-title">${esc(p.title || '')}</h3>
              <p class="project-desc">${esc(p.description || '')}</p>
              <ul class="project-features">
                ${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}
              </ul>
            </div>
            <div class="project-side">${gh}</div>
          </article>
        `;
      }).join('');
    }

    const intro = document.getElementById('contact-intro');
    if (intro) intro.textContent = contact.intro || '';

    const emailLink = document.getElementById('contact-email');
    if (emailLink && contact.email) {
      emailLink.href = `mailto:${contact.email}`;
      document.getElementById('contact-email-val').textContent = contact.email;
    }
    const phoneLink = document.getElementById('contact-phone');
    if (phoneLink && contact.phone) {
      phoneLink.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
      document.getElementById('contact-phone-val').textContent = contact.phone;
    }
    const avail = document.getElementById('avail-text');
    if (avail) avail.textContent = contact.availability || '';

    const li = document.getElementById('social-linkedin');
    if (li && contact.linkedinUrl) {
      li.href = contact.linkedinUrl;
      document.getElementById('linkedin-handle').textContent = contact.linkedinHandle || '';
    }
    const gh = document.getElementById('social-github');
    if (gh && contact.githubUrl) {
      gh.href = contact.githubUrl;
      document.getElementById('github-handle').textContent = contact.githubHandle || '';
    }

    const footer = document.getElementById('footer-copy');
    if (footer) footer.textContent = site.footerCopy || '';

    bindHover();
  }

  fetch(`${API}/api/content`)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(render)
    .catch(() => {});

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.querySelector('.submit-text').style.display = 'none';
      submitBtn.querySelector('.submit-loading').style.display = 'inline';

      const payload = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
      };

      try {
        const res = await fetch(`${API}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to send');
        }
        form.reset();
        submitBtn.style.display = 'none';
        formSuccess.style.display = 'flex';
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.querySelector('.submit-text').style.display = 'flex';
        submitBtn.querySelector('.submit-loading').style.display = 'none';
        alert(err.message || 'Something went wrong. Please try emailing me directly.');
      }
    });
  }
})();

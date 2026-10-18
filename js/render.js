// HTML for the home page sections that come from the database. Shared by the browser
// (js/portfolio.js refreshes the page with live data) and the build (scripts/build-site.mjs
// writes the same HTML into index.html so search engines and no-JS visitors see real content).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PortfolioRender = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // **bold** in admin-written paragraphs
  function rich(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  // Only plain web links are ever placed in href attributes (never javascript: and the like)
  function safeUrl(url) {
    return /^https?:\/\/[^\s<>"']+$/i.test(String(url || '').trim()) ? String(url).trim() : '';
  }

  function slugify(text) {
    return String(text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  const pad = (n) => String(n).padStart(2, '0');
  const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';
  const GITHUB_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>';

  function emptyNote(text) {
    return `<p class="empty-note">${text}</p>`;
  }

  function heroStats(hero) {
    const stats = (hero.stats || []).map((s) => `
          <div class="hero-stat${s.fullWidth ? ' hero-stat--wide' : ''}">
            <div class="hero-stat-num">${esc(s.num)}</div>
            <div class="hero-stat-lbl">${esc(s.label)}</div>
          </div>`).join('');
    const stack = (hero.primaryStack || []).map((t) => `<li class="tag hi">${esc(t)}</li>`).join('');
    return `${stats}
          <div class="hero-stat hero-stat--wide">
            <div class="hero-stat-lbl">Primary stack</div>
            <ul class="chips">${stack}</ul>
          </div>`;
  }

  function aboutText(about) {
    return (about.paragraphs || []).map((p) => `<p>${rich(p)}</p>`).join('');
  }

  // Email and phone rows become links
  function metaValue(m) {
    const value = String(m.value || '');
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `<a href="mailto:${esc(value)}" data-track="email_click">${esc(value)}</a>`;
    if (/^\+?[\d\s()-]{7,}$/.test(value)) return `<a href="tel:${esc(value.replace(/[^\d+]/g, ''))}" data-track="phone_click">${esc(value)}</a>`;
    return esc(value);
  }

  function aboutMeta(about) {
    return (about.meta || []).map((m) => `
          <div class="meta-row${m.highlight ? ' meta-row--highlight' : ''}">
            <dt class="meta-key">${esc(m.key)}</dt>
            <dd class="meta-val">${metaValue(m)}</dd>
          </div>`).join('');
  }

  function skills(list) {
    if (!list || !list.length) return emptyNote('Skills are being updated. Check back soon.');
    return list.map((s, i) => `
        <div class="skill-card${s.fullWidth ? ' skill-card--wide' : ''}">
          <div class="skill-num" aria-hidden="true">${esc(s.subtitle || `${pad(i + 1)} / ${s.title}`)}</div>
          <h3 class="skill-card-title">${esc(s.title)}</h3>
          <ul class="tag-cloud">
            ${(s.tags || []).map((t) => `<li class="tag${t.highlight ? ' hi' : ''}">${esc(t.name)}</li>`).join('')}
          </ul>
        </div>`).join('');
  }

  function experience(list) {
    if (!list || !list.length) return emptyNote('Work history is being updated.');
    return list.map((item) => `
        <article class="timeline-item">
          <div class="timeline-date">${esc(item.date)}</div>
          <h3 class="timeline-role">${esc(item.role)}</h3>
          <div class="timeline-company">${esc(item.company)}</div>
          <ul class="timeline-stack">
            ${(item.stack || []).map((t) => `<li class="stack-badge">${esc(t)}</li>`).join('')}
          </ul>
          <ul class="timeline-bullets">
            ${(item.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}
          </ul>
        </article>`).join('');
  }

  function projects(list) {
    if (!list || !list.length) {
      return `<li>${emptyNote('No projects are published yet. <a href="#contact">Ask me about my current work</a>.')}</li>`;
    }
    return list.map((p, i) => {
      const slug = p.slug || slugify(p.title);
      const live = safeUrl(p.liveUrl);
      const source = safeUrl(p.githubUrl);
      const status = p.statusKind === 'live'
        ? `<span class="proj-badge proj-badge-live">${esc(String(p.statusLabel || 'Live').replace(/^[●•]\s*/, ''))}</span>`
        : p.statusKind === 'type' && p.statusLabel ? `<span class="proj-badge proj-badge-type">${esc(p.statusLabel)}</span>` : '';
      return `
        <li class="project-card">
          <div class="project-num" aria-hidden="true">${pad(i + 1)}</div>
          <div class="project-body">
            <div class="project-tags-row">
              ${status}
              ${(p.techs || []).map((t) => `<span class="proj-badge proj-badge-tech">${esc(t)}</span>`).join('')}
            </div>
            <h3 class="project-title"><a href="/projects/${esc(slug)}">${esc(p.title)}</a></h3>
            <p class="project-desc">${esc(p.description)}</p>
            <ul class="project-features">
              ${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}
            </ul>
          </div>
          <div class="project-side">
            ${live ? `<a href="${esc(live)}" target="_blank" rel="noopener" class="project-link" data-track="project_live_click" data-label="${esc(p.title)}">Live site${NEW_TAB}</a>` : ''}
            ${source ? `<a href="${esc(source)}" target="_blank" rel="noopener" class="project-link" data-track="project_source_click" data-label="${esc(p.title)}">${GITHUB_ICON} Source${NEW_TAB}</a>` : ''}
            <a href="/projects/${esc(slug)}" class="project-link">Details<span class="sr-only"> about ${esc(p.title)}</span></a>
          </div>
        </li>`;
    }).join('');
  }

  return { esc, rich, safeUrl, slugify, heroStats, aboutText, aboutMeta, skills, experience, projects };
}));

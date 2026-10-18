// Behaviour shared by every public page: theme, mobile menu, consent and analytics.
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: settings last for this page view only */ }
    return null;
  }

  // ── Theme ──────────────────────────────────────────────────────────────────────────────────
  const themeBtn = document.getElementById('themeToggle');
  function syncThemeButton() {
    if (!themeBtn) return;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
      syncThemeButton();
    });
  }

  // ── Mobile menu ────────────────────────────────────────────────────────────────────────────
  const menuBtn = document.getElementById('menuToggle');
  const menu = document.getElementById('nav-links');
  function setMenu(open, { focusButton = false } = {}) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    if (open) menu.querySelector('a')?.focus();
    else if (focusButton) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, { focusButton: true });
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('is-open') && !e.target.closest('.site-nav')) setMenu(false);
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  // ── Small page details ─────────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  const progress = document.getElementById('progressBar');
  if (progress) {
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  // Highlights the menu entry for the section in view (home page)
  const sectionLinks = new Map();
  document.querySelectorAll('.nav-links a[href^="/#"]').forEach((a) => sectionLinks.set(a.getAttribute('href').slice(2), a));
  if (sectionLinks.size && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = sectionLinks.get(entry.target.id);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionLinks.forEach((_link, id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  // ── Settings published by the API (analytics ID, anti-spam key) ───────────────────────────
  let configPromise = null;
  function siteConfig() {
    if (!configPromise) {
      configPromise = fetch('/api/config', { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({}));
    }
    return configPromise;
  }

  // ── Analytics: Google Analytics loads only after the visitor accepts ──────────────────────
  const CONSENT_KEY = 'pf-consent-v1';
  let gaReady = false;

  function loadAnalytics(id) {
    if (gaReady || !id) return;
    gaReady = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }

  function removeAnalyticsCookies() {
    const host = location.hostname;
    const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
    document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((name) => /^_ga/.test(name)).forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }

  // Sends an event if the visitor allowed analytics; otherwise does nothing
  function track(name, params = {}) {
    if (gaReady && typeof window.gtag === 'function') window.gtag('event', name, params);
  }
  window.pfTrack = track;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button');
    if (!el) return;
    if (el.dataset.track) {
      track(el.dataset.track, { label: el.dataset.label || el.textContent.trim().slice(0, 80), link_url: el.href || undefined });
    } else if (el.tagName === 'A' && el.host && el.host !== location.host && /^https?:$/.test(el.protocol)) {
      track('outbound_click', { link_url: el.href });
    } else if (el.tagName === 'A' && /\.pdf($|\?)/i.test(el.pathname)) {
      track('file_download', { link_url: el.href });
    }
  });

  // ── Cookie consent banner ──────────────────────────────────────────────────────────────────
  let banner = null;

  function buildBanner(hasAnalytics) {
    banner = document.createElement('section');
    banner.className = 'consent';
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML = hasAnalytics
      ? `<h2 class="consent-title" id="consent-title">Can I measure your visit?</h2>
         <p class="consent-text">With your permission I use Google Analytics cookies to count visits and see which pages help people. Nothing is used for advertising. You can change this any time from "Cookie settings" at the bottom of the page. <a href="/cookies.html">Cookie policy</a></p>
         <div class="consent-actions">
           <button type="button" class="btn btn-primary" data-consent="granted">Allow analytics</button>
           <button type="button" class="btn btn-ghost" data-consent="denied">Only necessary</button>
         </div>`
      : `<h2 class="consent-title" id="consent-title">Cookie settings</h2>
         <p class="consent-text">This site does not use analytics or advertising cookies right now. It only stores your theme choice on your device. <a href="/cookies.html">Cookie policy</a></p>
         <div class="consent-actions"><button type="button" class="btn btn-ghost" data-consent="close">Close</button></div>`;
    banner.hidden = true;
    document.body.appendChild(banner);
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-consent]')?.dataset.consent;
      if (!choice) return;
      if (choice !== 'close') applyConsent(choice);
      banner.hidden = true;
    });
  }

  let gaId = null;
  function applyConsent(choice) {
    const previous = store(CONSENT_KEY);
    store(CONSENT_KEY, choice);
    if (choice === 'granted') loadAnalytics(gaId);
    if (choice === 'denied') {
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
      removeAnalyticsCookies();
      // Analytics already running on this page stops fully on the next page load
      if (previous === 'granted' && gaReady) location.reload();
    }
  }

  function openSettings() {
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector('button')?.focus();
  }

  siteConfig().then((config) => {
    gaId = config.gaMeasurementId || null;
    buildBanner(Boolean(gaId));
    const choice = store(CONSENT_KEY);
    if (gaId && choice === 'granted') loadAnalytics(gaId);
    else if (gaId && !choice) banner.hidden = false;
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cookie-settings]')) openSettings();
  });

  window.pfSiteConfig = siteConfig;
}());

const { PERSON } = require('../server/views/layout');

module.exports = {
  path: '/accessibility.html',
  title: 'Accessibility Statement | Prajwal Sainju',
  description: 'How this website meets WCAG 2.2 AA, the known limitations, and how to report an accessibility problem.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Accessibility statement', path: '/accessibility.html' }],
  body: `
      <h1 class="page-title">Accessibility statement</h1>
      <p class="updated">Last updated: 18 October 2026</p>
      <div class="prose">
        <p>I want everyone to be able to use this website, whatever device, browser or assistive technology they use. This statement covers the public pages of this site. The admin portal, which only site administrators use, is not covered.</p>

        <h2>Standard</h2>
        <p>The site aims to meet the <a href="https://www.w3.org/TR/WCAG22/">Web Content Accessibility Guidelines (WCAG) 2.2</a> at level AA. It is <strong>partially conformant</strong>: most of the site meets the standard, with the exceptions listed below.</p>

        <h2>What has been done</h2>
        <ul>
          <li>Every page works with a keyboard alone, shows a clearly visible focus outline and has a "Skip to content" link.</li>
          <li>Text and interface colours meet the AA contrast ratio of 4.5:1 in both the dark and light themes.</li>
          <li>Pages use headings, landmarks and lists in a logical order so screen readers can navigate them.</li>
          <li>Images have text alternatives; decorative images and icons are hidden from screen readers.</li>
          <li>Form fields have visible labels, errors are explained in text next to the field and announced, and nothing relies on colour alone.</li>
          <li>Animation is minimal and switches off when your device is set to reduce motion.</li>
          <li>Pages adapt to narrow screens down to 320 pixels and to zoom up to 400% without horizontal scrolling.</li>
          <li>Links that open a new tab say so to screen-reader users.</li>
        </ul>

        <h2>Known limitations</h2>
        <ul>
          <li>The downloadable PDF résumé may not be fully tagged for screen readers. The same content is available as an accessible web page on the <a href="/resume.html">résumé page</a>.</li>
          <li>Linked external sites (LinkedIn, GitHub, project websites) are outside my control.</li>
          <li>If the optional Cloudflare anti-spam check is switched on, it is provided by Cloudflare and follows their accessibility standards.</li>
        </ul>

        <h2>How it was checked</h2>
        <p>Self-assessment on 18 October 2026, using automated testing with Lighthouse and axe-core, manual keyboard-only testing, and checks at phone and desktop sizes in light and dark themes.</p>

        <h2>Feedback</h2>
        <p>If something on this site is hard to use, or you need content in another format, please tell me: email <a href="mailto:${PERSON.email}">${PERSON.email}</a> or call <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>. I aim to reply within 5 working days.</p>
      </div>`,
};

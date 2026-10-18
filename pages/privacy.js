const { PERSON } = require('../server/views/layout');

module.exports = {
  path: '/privacy.html',
  title: 'Privacy Policy | Prajwal Sainju',
  description: 'What personal data this website collects, why, where it is stored, how long it is kept and how to have it deleted.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Privacy policy', path: '/privacy.html' }],
  body: `
      <h1 class="page-title">Privacy policy</h1>
      <p class="updated">Last updated: 18 October 2026</p>
      <div class="prose">
        <p>This policy explains what personal data this website collects, why, and what you can do about it. I collect as little as possible: only what I need to answer you and, if you allow it, to count visits.</p>

        <h2>Who is responsible</h2>
        <p>${PERSON.name}, ${PERSON.locality}, ${PERSON.country}. Email <a href="mailto:${PERSON.email}">${PERSON.email}</a> with any privacy question or request.</p>

        <h2>What I collect and why</h2>
        <div class="table-scroll">
        <table>
          <thead><tr><th scope="col">Data</th><th scope="col">Why</th><th scope="col">Legal basis</th><th scope="col">Kept for</th></tr></thead>
          <tbody>
            <tr><td>Your name, email address and message from the contact form, and the time you agreed to this policy</td><td>To read and answer your message</td><td>Your consent, given with the checkbox on the form</td><td>Until it is no longer needed to reply, and at most 24 months after your last message</td></tr>
            <tr><td>Pages viewed, approximate location (country or city), device and browser type, only if you click "Allow analytics"</td><td>To understand which pages are useful (Google Analytics)</td><td>Your consent, which you can withdraw at any time</td><td>Up to 14 months in Google Analytics</td></tr>
            <tr><td>IP address and request details in server logs</td><td>To keep the site running and secure, for example to block abuse</td><td>Legitimate interest in a secure website</td><td>Short-term, as set by the hosting provider</td></tr>
          </tbody>
        </table>
        </div>
        <p>The contact form does not store your IP address, browser details or any tracking identifier. I do not sell personal data, use it for advertising, or make automated decisions about you.</p>

        <h2>Who processes the data for me</h2>
        <ul>
          <li><strong>Netlify</strong> hosts the website and runs its server code.</li>
          <li><strong>MongoDB Atlas</strong> stores contact messages in its database service.</li>
          <li>My <strong>email provider</strong> delivers a copy of each message to my inbox.</li>
          <li><strong>Google Analytics</strong> measures visits, only after you allow it.</li>
          <li><strong>Cloudflare Turnstile</strong> may check that the contact form is filled in by a person, not a bot.</li>
        </ul>
        <p>Some of these providers process data outside Nepal, including in the United States and the European Union, under their own data protection terms.</p>

        <h2>Cookies and similar storage</h2>
        <p>The <a href="/cookies.html">cookie policy</a> lists everything stored on your device. Analytics cookies are only set if you accept them. Change your choice at any time with "Cookie settings" at the bottom of every page.</p>

        <h2>Your rights</h2>
        <p>You can ask to see the data I hold about you, correct it, delete it, or withdraw your consent. Email <a href="mailto:${PERSON.email}">${PERSON.email}</a> and I will reply within 30 days. Withdrawing consent does not affect anything done before you withdrew it. If you think your data has been mishandled, you can also complain to the data protection authority where you live.</p>

        <h2>Security</h2>
        <p>The site is served only over HTTPS. Messages are stored in a database that only signed-in administrators can read, and every administrator uses two-step verification.</p>

        <h2>Children</h2>
        <p>This site is not aimed at children under 16, and I do not knowingly collect their data.</p>

        <h2>Changes</h2>
        <p>If this policy changes, the new version is published here with a new date at the top.</p>
      </div>`,
};

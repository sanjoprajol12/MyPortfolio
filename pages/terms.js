const { PERSON } = require('../server/views/layout');

module.exports = {
  path: '/terms.html',
  title: 'Terms of Use | Prajwal Sainju',
  description: 'The terms for using this portfolio website, its content and the contact form.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Terms of use', path: '/terms.html' }],
  body: `
      <h1 class="page-title">Terms of use</h1>
      <p class="updated">Last updated: 18 October 2026</p>
      <div class="prose">
        <p>This is the personal portfolio of ${PERSON.name}. By using it you agree to these terms. If you do not agree, please do not use the site.</p>

        <h2>What this site is</h2>
        <p>The site presents my work, skills and experience and lets you contact me. It does not sell products or services, take payments or offer accounts to visitors.</p>

        <h2>Content and copyright</h2>
        <p>The text, photos, design and code of this site are mine unless stated otherwise. You may link to any page and quote short parts with credit. Please ask before reusing anything else. Project names and logos belong to their owners. Some listed projects were built in a team or for an employer; the project pages describe my part.</p>

        <h2>Using the contact form</h2>
        <p>Please use the form only to get in touch about work, projects or questions. Do not send spam, advertising, malicious links or anything unlawful. Messages that look automated or abusive are filtered and may be deleted without reply.</p>

        <h2>Links to other sites</h2>
        <p>Links to LinkedIn, GitHub and project websites are provided for convenience. I am not responsible for their content or how they handle your data.</p>

        <h2>No warranty</h2>
        <p>I keep the information here accurate and up to date, but the site is provided "as is", without guarantees that it is complete, error-free or always available. Nothing here is a binding offer of work.</p>

        <h2>Liability</h2>
        <p>To the extent the law allows, I am not liable for any loss arising from use of this site or reliance on its content.</p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Nepal.</p>

        <h2>Contact</h2>
        <p>Questions about these terms: <a href="mailto:${PERSON.email}">${PERSON.email}</a>.</p>
      </div>`,
};

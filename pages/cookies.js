module.exports = {
  path: '/cookies.html',
  title: 'Cookie Policy | Prajwal Sainju',
  description: 'Every cookie and item of browser storage this website uses, what it is for, how long it lasts and how to change your choice.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Cookie policy', path: '/cookies.html' }],
  body: `
      <h1 class="page-title">Cookie policy</h1>
      <p class="updated">Last updated: 18 October 2026</p>
      <div class="prose">
        <p>Cookies and browser storage are small pieces of data a website keeps on your device. This site uses only what it needs to work, plus analytics cookies if you allow them. There are no advertising cookies.</p>
        <p><button type="button" class="btn btn-ghost" data-cookie-settings>Change my cookie settings</button></p>

        <h2>Necessary (always on)</h2>
        <div class="table-scroll">
        <table>
          <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">Lasts</th></tr></thead>
          <tbody>
            <tr><td><code>theme</code></td><td>Browser storage</td><td>Remembers light or dark theme</td><td>Until you clear it</td></tr>
            <tr><td><code>pf-consent-v1</code></td><td>Browser storage</td><td>Remembers your analytics choice</td><td>Until you clear it</td></tr>
            <tr><td><code>pf_session</code></td><td>Cookie</td><td>Keeps an administrator signed in to the admin portal (not set for visitors)</td><td>12 hours</td></tr>
            <tr><td><code>pf_csrf</code></td><td>Cookie</td><td>Protects the admin portal against forged requests (not set for visitors)</td><td>Browser session</td></tr>
            <tr><td>Cloudflare Turnstile</td><td>Cookie, if used</td><td>Checks that the contact form is sent by a person</td><td>Short-lived</td></tr>
          </tbody>
        </table>
        </div>

        <h2>Analytics (only if you allow them)</h2>
        <div class="table-scroll">
        <table>
          <thead><tr><th scope="col">Name</th><th scope="col">Provider</th><th scope="col">Purpose</th><th scope="col">Lasts</th></tr></thead>
          <tbody>
            <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Tells visits apart</td><td>2 years</td></tr>
            <tr><td><code>_ga_*</code></td><td>Google Analytics</td><td>Keeps track of the current visit</td><td>2 years</td></tr>
          </tbody>
        </table>
        </div>
        <p>If you choose "Only necessary" or later withdraw consent, Google Analytics is not loaded and its cookies are deleted. See the <a href="/privacy.html">privacy policy</a> for how analytics data is handled.</p>

        <h2>Third-party sites</h2>
        <p>Links to LinkedIn, GitHub and project websites open those sites, which use their own cookies under their own policies. This site does not embed their content.</p>
      </div>`,
};

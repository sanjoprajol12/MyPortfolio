// Runs before the page is drawn so it never flashes the wrong theme.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', saved === 'light' || saved === 'dark' ? saved : (prefersLight ? 'light' : 'dark'));
  root.classList.add('js');
  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) root.classList.add('js-motion');
}());

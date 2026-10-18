// Résumé page: paper colour toggle and print button.
(function () {
  const root = document.documentElement;
  const sheetBtn = document.getElementById('sheetModeBtn');
  const sheetLabel = document.getElementById('sheetModeLabel');

  let saved = null;
  try { saved = localStorage.getItem('sheetMode'); } catch (e) { /* storage blocked */ }
  root.setAttribute('data-sheet-mode', saved === 'dark' ? 'dark' : 'light');

  function sync() {
    const dark = root.getAttribute('data-sheet-mode') === 'dark';
    sheetLabel.textContent = dark ? 'Light paper' : 'Dark paper';
    sheetBtn.setAttribute('aria-pressed', String(dark));
  }

  if (sheetBtn && sheetLabel) {
    sync();
    sheetBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-sheet-mode') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-sheet-mode', next);
      try { localStorage.setItem('sheetMode', next); } catch (e) { /* storage blocked */ }
      sync();
    });
  }

  document.getElementById('btnPrint')?.addEventListener('click', () => {
    window.pfTrack?.('resume_print');
    window.print();
  });
}());

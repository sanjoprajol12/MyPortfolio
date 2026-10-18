// Colours for the loading screen, saved by src/core/initConfig.ts via namespaceConfig()
(function () {
  var bg = '#FFFFFF';
  var color = '#9A7023';
  try {
    bg = localStorage.getItem('prajwal sainju-initial-loader-bg') || bg;
    color = localStorage.getItem('prajwal sainju-initial-loader-color') || color;
  } catch (e) { /* storage blocked */ }
  document.documentElement.style.setProperty('--initial-loader-bg', bg);
  document.documentElement.style.setProperty('--initial-loader-color', color);
}());

/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts() {
  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */'webfontloader')

  ;(webFontLoader as any).load({
    google: {
      api: 'https://fonts.googleapis.com/css2',

      // Same typeface as the public website
      families: ['Plus Jakarta Sans:wght@400;500;600;700;800&display=swap'],
    },
  })
}

export default function () {
  loadFonts()
}

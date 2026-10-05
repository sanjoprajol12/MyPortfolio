import { deepMerge } from '@antfu/utils'
import type { App } from 'vue'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './theme'
import { appConfig } from '@themeConfig'

import '@styles/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default function (app: App) {
  const cookieThemeValues = {
    defaultTheme: resolveVuetifyTheme(appConfig.app.theme),
    themes: {
      light: {
        colors: {
          'primary': cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
          'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
          search: staticPrimaryColor,
        },
      },

      // Dark mode uses its own lifted primary from theme.ts; the light brand colour is too dark to read on it
      dark: {
        colors: {
          'primary': cookieRef('darkThemePrimaryColor', themes.dark?.colors?.primary ?? staticPrimaryColor).value,
          'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', themes.dark?.colors?.['primary-darken-1'] ?? staticPrimaryDarkenColor).value,
          search: staticPrimaryColor,
        },
      },
    },
  }

  const optionTheme = deepMerge({ themes }, cookieThemeValues)

  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
      SearchBtn: VBtn, 
    },
    defaults,
    icons,
    theme: optionTheme,
  })

  app.use(vuetify)
}

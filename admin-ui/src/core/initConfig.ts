import { useStorage } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { type ThemeDefinition } from 'vuetify'
import { useAppConfigStore } from '@/store/config'
import { setRouterTabsPrimary, setRouterTabsTheme } from 'vue3-router-tab'
import { namespaceConfig } from '@/utils/helpers'

export interface ColorStyle {

  // Core colors
  primary: string;
  background: string;
  text: string;
  border: string;

  // Interactive states
  activeBackground: string;
  activeText: string;
  activeBorder: string;

  // Header specific
  headerBackground: string;

  // Button specific
  buttonBackground: string;
  buttonColor: string;
  activeButtonBackground: string;
  activeButtonColor: string;

  // Icon specific
  iconColor: string;
}

const defaultColors: ColorStyle = {
  primary: "#9A7023",
  background: "#ffffff",
  text: "#0b131f",
  border: "#e2e8f0",

  activeBackground: "#9A7023",
  activeText: "#ffffff",
  activeBorder: "#9A7023",

  headerBackground: "#ffffff",

  buttonBackground: "#f8fafc",
  buttonColor: "#9A7023",
  activeButtonBackground: "#9A7023",
  activeButtonColor: "#ffffff",

  iconColor: "#475569",
}

const defaultDarkColor: ColorStyle = {
  primary: "#D4A853",
  background: "#111A2B",
  text: "#f1f5f9",
  border: "#1e293b",

  activeBackground: "#111A2B",
  activeText: "#D4A853",
  activeBorder: "#D4A853",

  headerBackground: "#111A2B",

  buttonBackground: "#111A2B",
  buttonColor: "#f1f5f9",
  activeButtonBackground: "#D4A853",
  activeButtonColor: "#ffffff",

  iconColor: "#cbd5e1",
}


const _handleSkinChanges = () => {
  const { themes } = useTheme()
  const configStore = useAppConfigStore()

  // Create skin default color so that we can revert back to original (default skin) color when switch to default skin from bordered skin
  const themeDefinitions = Object.values(themes.value) as ThemeDefinition[]

  themeDefinitions.forEach(themeDefinition => {
    if (!themeDefinition.colors)
      return

    const colors = themeDefinition.colors

    colors['skin-default-background'] = colors.background ?? ''
    colors['skin-default-surface'] = colors.surface ?? ''
  })

  watch(
    () => configStore.skin,
    (val: string) => {
      themeDefinitions.forEach(themeDefinition => {
        if (!themeDefinition.colors)
          return

        const colors = themeDefinition.colors

        colors.background = colors[`skin-${val}-background`] ?? colors.background
        colors.surface = colors[`skin-${val}-surface`] ?? colors.surface
      })
    },
    { immediate: true },
  )
}

const _syncInitialLoaderTheme = () => {
  const themeStyle = useTheme()

  const loaderBg = useStorage<string | null>(namespaceConfig('initial-loader-bg'), null)
  const loaderColor = useStorage<string | null>(namespaceConfig('initial-loader-color'), null)

  // Follow the theme Vuetify actually renders ("system" resolves to light or dark),
  // so the tabs and the next page-load splash match what is on screen.
  watch(
    () => themeStyle.global.name.value,
    (themeName: string) => {
      const isDark = themeStyle.current.value.dark

      window.localStorage.setItem('tab-theme-style', themeName)

      loaderBg.value = themeStyle.current.value.colors.surface
      loaderColor.value = themeStyle.current.value.colors.primary

      setRouterTabsTheme(isDark ? 'dark' : 'light')
      setRouterTabsPrimary(isDark ? defaultDarkColor : defaultColors)
    },
    { immediate: true },
  )
}

const initCore = () => {
  _syncInitialLoaderTheme()
  _handleSkinChanges()
}

export default initCore
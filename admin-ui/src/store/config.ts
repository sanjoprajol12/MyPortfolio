import { appConfig } from '@themeConfig'
import { useTheme } from 'vuetify'
import { getCurrentInstance, inject } from 'vue'

export const useAppConfigStore = defineStore('appConfig', () => {
  const route = useRoute()

  // Single cookie-backed theme choice (light | dark | system). Applying it to Vuetify —
  // including following the OS while on "system" — happens in initAppConfigStore below.
  const theme = cookieRef<'light' | 'dark' | 'system'>('theme-style', appConfig.app.theme)

  //  isVerticalNavSemiDark
  const isVerticalNavSemiDark = cookieRef('isVerticalNavSemiDark', appConfig.navbar.isVerticalNavSemiDark)

  //  isVerticalNavSemiDark
  const skin = cookieRef('skin', appConfig.app.skin)

  //  Navbar Type
  const navbarType = ref(appConfig.navbar.type)

  //  Navbar Type
  const isNavbarBlurEnabled = cookieRef('isNavbarBlurEnabled', appConfig.navbar.navbarBlur)

  //  Vertical Nav Collapsed
  const isVerticalNavCollapsed = cookieRef('isVerticalNavCollapsed', appConfig.navbar.isVerticalNavCollapsed)

  //  App Content Width
  const appContentWidth = cookieRef('appContentWidth', appConfig.app.contentWidth)

  //  App Content Layout Nav
  const appContentLayoutNav = ref('vertical')

  const topNavbarPopoverOffset = ref(appConfig.topNavbar.popoverOffset)

  //  Footer Type
  const footerType = ref(appConfig.footer.type)

  //  Misc
  // One media-query listener for the store's lifetime (creating it inside a computed added a new listener on every re-evaluation)
  const isLessThanOverlayNavBreakpoint = useMediaQuery(`(max-width: ${appConfig.app.overlayNavFromBreakpoint}px)`)

  const windowScroll = getCurrentInstance()
    ? useWindowScroll()
    : { y: ref(0) }

  //  Layout Classes
  const _layoutClasses = computed(() => {
    const windowScrollY = windowScroll.y

    return [
      `layout-nav-type-${appContentLayoutNav.value}`,
      `layout-navbar-${navbarType.value}`,
      `layout-footer-${footerType.value}`,
      {
        'layout-vertical-nav-collapsed':
          isVerticalNavCollapsed.value
          && appContentLayoutNav.value === 'vertical'
          && !isLessThanOverlayNavBreakpoint.value,
      },
      { [`horizontal-nav-horizontal-layout`]: appContentLayoutNav.value === 'horizontal' },
      `layout-content-width-${appContentWidth.value}`,
      { 'layout-overlay-nav': isLessThanOverlayNavBreakpoint.value },
      { 'window-scrolled': unref(windowScrollY) },
      route.meta.layoutWrapperClasses ? route.meta.layoutWrapperClasses : null,
    ]
  })



  const isVerticalNavMini = (isVerticalNavHovered: Ref<boolean> | null = null) => {
    const fallback = ref(false)

    const isVerticalNavHoveredLocal = isVerticalNavHovered
      || inject(injectionKeyIsVerticalNavHovered, fallback)

    return computed(() => isVerticalNavCollapsed.value && !isVerticalNavHoveredLocal.value && !isLessThanOverlayNavBreakpoint.value)
  }

  // The admin is left-to-right only
  const isAppRTL = false

  return {
    theme,
    skin,
    isVerticalNavSemiDark,
    appContentWidth,
    appContentLayoutNav,
    navbarType,
    isNavbarBlurEnabled,
    isVerticalNavCollapsed,
    footerType,
    isLessThanOverlayNavBreakpoint,
    _layoutClasses,
    isVerticalNavMini,
    topNavbarPopoverOffset,
    isAppRTL,
  }
})

export const initAppConfigStore = () => {
  const userPreferredColorScheme = usePreferredColorScheme()
  const themeStyle = useTheme()
  const configStore = useAppConfigStore()

  // "system" follows the OS; usePreferredColorScheme can also report "no-preference", which is not a theme name
  watch(
    [() => configStore.theme, userPreferredColorScheme],
    () => {
      const theme = configStore.theme === 'system'
        ? userPreferredColorScheme.value === 'dark'
          ? 'dark'
          : 'light'
        : configStore.theme

      themeStyle.change(theme)
    },
    { immediate: true },
  )
}

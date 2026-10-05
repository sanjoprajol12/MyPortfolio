import type { AppLayoutConfig } from '@/types/layouts'

export const defineLayoutThemeConfig = (appConfig: AppLayoutConfig): { appConfig: AppLayoutConfig } => {
  return {
    appConfig: {
      app: {
        title: appConfig.app.title,
        tagline: appConfig.app.tagline,
        logo: appConfig.app.logo,
        contentWidth: appConfig.app.contentWidth,
        overlayNavFromBreakpoint: appConfig.app.overlayNavFromBreakpoint,
        theme: appConfig.app.theme,
        skin: appConfig.app.skin,
        iconRenderer: appConfig.app.iconRenderer,
      },
      navbar: {
        type: appConfig.navbar.type,
        navbarBlur: appConfig.navbar.navbarBlur,
        isVerticalNavCollapsed: appConfig.navbar.isVerticalNavCollapsed,
        defaultNavItemIconProps: appConfig.navbar.defaultNavItemIconProps,
        isVerticalNavSemiDark: appConfig.navbar.isVerticalNavSemiDark,
      },
      footer: { type: appConfig.footer.type },
      topNavbar: {
        transition: appConfig.topNavbar.transition,
        popoverOffset: appConfig.topNavbar.popoverOffset,
      },
      icons: {
        chevronDown: appConfig.icons.chevronDown,
        chevronRight: appConfig.icons.chevronRight,
        close: appConfig.icons.close,
        verticalNavPinned: appConfig.icons.verticalNavPinned,
        verticalNavUnPinned: appConfig.icons.verticalNavUnPinned,
        sectionTitlePlaceholder: appConfig.icons.sectionTitlePlaceholder,
      },
    },
  }
}

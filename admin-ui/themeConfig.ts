import { breakpointsVuetifyV3 } from '@vueuse/core'
import { VIcon } from 'vuetify/components/VIcon'
import { Skins } from '@/types/enums'
import { ContentWidth, FooterType, NavbarType } from '@/types/enums'

import { defineLayoutThemeConfig } from '@/core'

export const { appConfig } = defineLayoutThemeConfig({
  app: {
    title: 'prajwal sainju',
    tagline: 'Portfolio admin',

    // Initials mark in the portfolio's gold on the brand dark
    logo: h('span', {
      style: 'display:flex; align-items:center; justify-content:center; height:34px; width:34px; border-radius:8px; background:#0B131F; color:#D4A853; font-family:Georgia, serif; font-weight:700; font-size:15px;',
    }, 'PS'),
    contentWidth: ContentWidth.Fluid,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.md + 16,
    theme: 'light',
    skin: Skins.Bordered,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'circle' },
    isVerticalNavSemiDark: false,
  },
  topNavbar: {
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },
  footer: { type: FooterType.Static },
  icons: {
    chevronDown: { icon: 'chevron-down' },
    chevronRight: { icon: 'chevron-right' },
    close: { icon: 'x' },
    verticalNavPinned: { icon: 'chevron-left' },
    verticalNavUnPinned: { icon: 'chevron-right' },
    sectionTitlePlaceholder: { icon: 'minus' },
  },
})

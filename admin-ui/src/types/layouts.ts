import type { ValueOf } from 'type-fest'
import type { RouteLocationRaw } from 'vue-router'
import type { ContentWidth, FooterType, NavbarType, Skins } from '@/types/enums'
import type { Component, VNode } from 'vue'

export interface AppLayoutConfig {
  app: {
    title: Lowercase<string>
    tagline: string
    logo: VNode
    contentWidth: typeof ContentWidth[keyof typeof ContentWidth]
    overlayNavFromBreakpoint: number
    theme: 'light' | 'dark' | 'system'
    skin: ValueOf<typeof Skins>
    iconRenderer: Component
  }
  navbar: {
    type: typeof NavbarType[keyof typeof NavbarType]
    navbarBlur: boolean
    isVerticalNavCollapsed: boolean
    defaultNavItemIconProps: unknown
    isVerticalNavSemiDark: boolean
  }
  topNavbar: {
    transition: string
    popoverOffset: number
  }
  footer: {
    type: typeof FooterType[keyof typeof FooterType]
  }
  icons: {
    chevronDown: object
    chevronRight: object
    close: object
    verticalNavPinned: object
    verticalNavUnPinned: object
    sectionTitlePlaceholder: object
  }
}

export interface AclProperties {
  action: string
  subject: string
}

export interface NavSectionTitle extends Partial<AclProperties> {
  heading: string
}

declare type ATagTargetAttrValues = '_blank' | '_self' | '_parent' | '_top' | 'framename'

declare type ATagRelAttrValues =
  | 'alternate'
  | 'author'
  | 'bookmark'
  | 'external'
  | 'help'
  | 'license'
  | 'next'
  | 'nofollow'
  | 'noopener'
  | 'noreferrer'
  | 'prev'
  | 'search'
  | 'tag'

export interface NavLinkProps {
  to?: RouteLocationRaw | string | null
  href?: string
  target?: ATagTargetAttrValues
  rel?: ATagRelAttrValues
}

export interface NavLink extends NavLinkProps, Partial<AclProperties> {
  title: string
  icon?: unknown
  badgeContent?: string
  badgeClass?: string
  disable?: boolean
}

export interface NavGroup extends Partial<AclProperties> {
  title: string
  icon?: unknown
  badgeContent?: string
  badgeClass?: string
  children: (NavLink | NavGroup)[]
  disable?: boolean
}

export declare type VerticalNavItems = (NavLink | NavGroup | NavSectionTitle)[]

export declare type TopNavItems = (NavLink | NavGroup)[]

export type Notification = {
  id: number | string
  title: string
  subtitle: string
  time: string
  color?: string
  isSeen: boolean
} & (
    | { img: string; text?: never; icon?: never }
    | { img?: never; text: string; icon?: never }
    | { img?: never; text?: never; icon: string }
  )

export interface ThemeStyle {
  name: string
  icon: string
}

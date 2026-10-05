import type { RouteLocationMatched, Router } from 'vue-router'
import type { NavGroup, NavLink, NavLinkProps } from '@/types/layouts'
import { useAppConfigStore } from '@/store/config'

export const openGroups = ref<string[]>([])

export const injectionKeyIsVerticalNavHovered: InjectionKey<Ref<boolean>> = Symbol('isVerticalNavHovered')

export const getComputedNavLinkToProp = computed(() => (link: NavLink) => {
  const props: NavLinkProps = {
    target: link.target,
    rel: link.rel,
  }

  if (link.to)
    props.to = typeof link.to === 'string' ? { name: link.to } : link.to
  else props.href = link.href

  return props
})

export const resolveNavLinkRouteName = (link: NavLink, router: Router) => {
  if (!link.to)
    return null

  if (typeof link.to === 'string')
    return link.to

  if (typeof link.to === 'object') {
    const resolved = router.resolve(link.to)
    
    return resolved.params?.path ?? resolved.name
  }

  return router.resolve(link.to).name
}

export const isNavLinkActive = (link: NavLink, router: Router) => {
  const currentRoute = router.currentRoute.value
  const matchedRoutes = currentRoute.matched
  const resolveRoutedName = resolveNavLinkRouteName(link, router)

  if (!resolveRoutedName)
    return false

  const nameMatches = matchedRoutes.some((matchedRoute: RouteLocationMatched) => {
    return matchedRoute.name === resolveRoutedName || matchedRoute.meta.navActiveLink === resolveRoutedName
  })

  if (!nameMatches)
    return false

  if (link.to && typeof link.to === 'object' && 'query' in link.to && link.to.query) {
    const linkQuery = link.to.query as Record<string, string>
    
    return Object.entries(linkQuery).every(([key, val]) => String(currentRoute.query[key]) === String(val))
  }

  return true
}

export const isNavGroupActive = (children: (NavLink | NavGroup)[], router: Router): boolean =>
  children.some(child => {
    if ('children' in child)
      return isNavGroupActive(child.children, router)

    return isNavLinkActive(child, router)
  })


export const _setDirAttr = (dir: 'ltr' | 'rtl') => {
  if (typeof document !== 'undefined')
    document.documentElement.setAttribute('dir', dir)
}

export const hexToRgbColor = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

  hex = hex.replace(shorthandRegex, (m: string, r: string, g: string, b: string) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (!result)
    return null

  const [, r = '', g = '', b = ''] = result

  if (!r || !g || !b)
    return null

  return `${Number.parseInt(r, 16)},${Number.parseInt(g, 16)},${Number.parseInt(b, 16)}`
}

export const rgbaToHex = (rgba: string, forceRemoveAlpha = false) => {
  const components = rgba
    .replace(/^rgba?\(|\s+|\)$/g, '')
    .split(',')
    .map(part => part.trim())

  const componentsToUse = forceRemoveAlpha ? components.slice(0, 3) : components

  const numericValues = componentsToUse.map((part, index) => {
    const value = Number.parseFloat(part)

    return index === 3 ? Math.round(value * 255) : value
  })

  const hex = numericValues
    .map(value => value.toString(16))
    .map(piece => (piece.length === 1 ? `0${piece}` : piece))
    .join('')

  return `#${hex}`
}

export const switchToVerticalNavOnLtOverlayNavBreakpoint = () => {
  const configStore = useAppConfigStore()

  const lgAndUpNav = ref<string>(configStore.appContentLayoutNav)

  watch(
    () => configStore.appContentLayoutNav,
    (value: string) => {
      if (!configStore.isLessThanOverlayNavBreakpoint)
        lgAndUpNav.value = value
    },
  )

  watch(() => configStore.isLessThanOverlayNavBreakpoint, (val: boolean) => {
    configStore.appContentLayoutNav = val ? 'vertical' : lgAndUpNav.value
  }, { immediate: true })
}

export const getDynamicI18nProps = (key: string, tag = 'span') => {
  const data = false
  if (!data)
    return {}

  return {
    keypath: key,
    tag,
    scope: 'global',
  }
}

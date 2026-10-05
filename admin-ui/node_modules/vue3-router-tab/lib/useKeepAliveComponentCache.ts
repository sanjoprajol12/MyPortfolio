import { defineComponent, getCurrentInstance, h, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { RouterTabsContext } from './core/types'

export function useKeepAliveComponentCache(controller: RouterTabsContext) {
  const componentCache = new Map<string, unknown>()

  function createNamedComponent(component: any, name: string) {
    return defineComponent({
      name,
      setup(_, { attrs, slots }) {
        const innerRef = ref<any>()

        const instance = getCurrentInstance()
        if (instance?.proxy) {
          const proxy = instance.proxy as any
          const forwardProps: Record<string, () => any> = {
            routeTabTitle: () => innerRef.value?.routeTabTitle,
            routeTabIcon: () => innerRef.value?.routeTabIcon,
            routeTabClosable: () => innerRef.value?.routeTabClosable,
            routeTabMeta: () => innerRef.value?.routeTabMeta,
            $: () => innerRef.value
          }

          Object.entries(forwardProps).forEach(([key, getter]) => {
            Object.defineProperty(proxy, key, {
              get: getter,
              configurable: true
            })
          })
        }

        return () => h(component, { ...attrs, ref: innerRef }, slots)
      }
    })
  }

  function pruneComponentCache() {
    const validKeys = new Set(controller.tabs.map(tab => `${tab.id}::${tab.renderKey ?? 0}`))

    Array.from(componentCache.keys()).forEach(key => {
      if (!validKeys.has(key)) {
        componentCache.delete(key)
      }
    })
  }

  function getNamedComponent(component: any, cacheKey: string) {
    if (!component) return component
    const cached = componentCache.get(cacheKey)
    if (cached) return cached

    const wrapped = createNamedComponent(component, cacheKey)
    componentCache.set(cacheKey, wrapped)
    return wrapped
  }

  function getComponentCacheKey(route: RouteLocationNormalizedLoaded): string {
    const routeKey = controller.getRouteKey(route)
    const tab = controller.tabs.find(item => item.id === routeKey)

    if (!tab) {
      return `${routeKey}::0`
    }

    return `${routeKey}::${tab.renderKey ?? 0}`
  }

  function clearComponentCache() {
    componentCache.clear()
  }

  return {
    getNamedComponent,
    getComponentCacheKey,
    pruneComponentCache,
    clearComponentCache
  }
}

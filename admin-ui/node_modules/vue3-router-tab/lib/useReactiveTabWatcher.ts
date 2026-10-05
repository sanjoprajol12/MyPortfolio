import { computed, ref, watch } from 'vue'
import type { RouterTabsContext, TabRecord } from './core/types'

type MaybeRefLike<T = unknown> = T | { value: T }

interface ReactiveTabExpose {
  routeTabTitle?: MaybeRefLike
  routeTabIcon?: MaybeRefLike
  routeTabClosable?: MaybeRefLike
  routeTabMeta?: MaybeRefLike<Record<string, unknown>> | Record<string, unknown>
  $?: ReactiveTabExpose
}

function readExposedValue(source: MaybeRefLike | undefined) {
  return source && typeof source === 'object' && 'value' in source ? source.value : source
}

function hasReactiveTabExpose(value: unknown): value is ReactiveTabExpose {
  if (!value || typeof value !== 'object') return false
  const exposed = value as ReactiveTabExpose
  return (
    exposed.routeTabTitle !== undefined ||
    exposed.routeTabIcon !== undefined ||
    exposed.routeTabClosable !== undefined ||
    exposed.routeTabMeta !== undefined
  )
}

function getFallbackTitle(tab: TabRecord): string {
  if (typeof tab.title === 'string' && tab.title.trim()) return tab.title
  if (Array.isArray(tab.title) && tab.title.length && String(tab.title[0]).trim()) return String(tab.title[0])
  return 'Untitled'
}

export function useReactiveTabWatcher(controller: RouterTabsContext) {
  const tabUpdateTrigger = ref(0)
  const componentInstances = new Map<string, unknown>()
  const watchedProperties = new Map<string, (() => void)[]>()

  const reactiveTabTitles = computed(() => {
    tabUpdateTrigger.value
    const titles: Record<string, string> = {}
    controller.tabs.forEach(tab => {
      titles[tab.id] = typeof tab.title === 'string' ? tab.title : String(tab.title || getFallbackTitle(tab))
    })
    return titles
  })

  function triggerTabUpdate() {
    tabUpdateTrigger.value++
  }

  function setupComponentWatching(routeKey: string, componentInstance: ReactiveTabExpose) {
    if (!componentInstance || componentInstances.has(routeKey)) return

    try {
      componentInstances.set(routeKey, componentInstance)

      const tab = controller.tabs.find(t => controller.getRouteKey(t.to) === routeKey)
      if (!tab) {
        console.warn(`[RouterTab] Cannot setup watching: tab not found for ${routeKey}`)
        return
      }

      const unwatchers: (() => void)[] = []

      if (componentInstance.routeTabTitle !== undefined) {
        try {
          const unwatchTitle = watch(
            () => readExposedValue(componentInstance.routeTabTitle),
            (newTitle) => {
              if (newTitle !== undefined && newTitle !== null) {
                tab.title = String(newTitle)
                triggerTabUpdate()
              }
            },
            { immediate: true }
          )
          unwatchers.push(unwatchTitle)
        } catch (error) {
          console.error(`[RouterTab] Error watching routeTabTitle for ${routeKey}:`, error)
        }
      }

      if (componentInstance.routeTabIcon !== undefined) {
        try {
          const unwatchIcon = watch(
            () => readExposedValue(componentInstance.routeTabIcon),
            (newIcon) => {
              if (newIcon !== undefined && newIcon !== null) {
                tab.icon = String(newIcon)
                triggerTabUpdate()
              }
            },
            { immediate: true }
          )
          unwatchers.push(unwatchIcon)
        } catch (error) {
          console.error(`[RouterTab] Error watching routeTabIcon for ${routeKey}:`, error)
        }
      }

      if (componentInstance.routeTabClosable !== undefined) {
        try {
          const unwatchClosable = watch(
            () => readExposedValue(componentInstance.routeTabClosable),
            (newClosable) => {
              if (newClosable !== undefined && newClosable !== null) {
                tab.closable = Boolean(newClosable)
                triggerTabUpdate()
              }
            },
            { immediate: true }
          )
          unwatchers.push(unwatchClosable)
        } catch (error) {
          console.error(`[RouterTab] Error watching routeTabClosable for ${routeKey}:`, error)
        }
      }

      if (componentInstance.routeTabMeta !== undefined) {
        try {
          const unwatchMeta = watch(
            () => readExposedValue(componentInstance.routeTabMeta),
            (newMeta) => {
              if (newMeta && typeof newMeta === 'object') {
                Object.assign(tab, newMeta)
                triggerTabUpdate()
              }
            },
            { immediate: true, deep: true }
          )
          unwatchers.push(unwatchMeta)
        } catch (error) {
          console.error(`[RouterTab] Error watching routeTabMeta for ${routeKey}:`, error)
        }
      }

      watchedProperties.set(routeKey, unwatchers)
    } catch (error) {
      console.error(`[RouterTab] Error in setupComponentWatching for ${routeKey}:`, error)
      cleanupComponentWatching(routeKey)
    }
  }

  function cleanupComponentWatching(routeKey: string) {
    try {
      const unwatchers = watchedProperties.get(routeKey)
      if (unwatchers) {
        unwatchers.forEach(unwatcher => {
          try {
            unwatcher()
          } catch (error) {
            console.error(`[RouterTab] Error cleaning up watcher for ${routeKey}:`, error)
          }
        })
        watchedProperties.delete(routeKey)
      }
      componentInstances.delete(routeKey)
    } catch (error) {
      console.error(`[RouterTab] Error in cleanupComponentWatching for ${routeKey}:`, error)
    }
  }

  function handleComponentRef(el: unknown, routeKey: string) {
    try {
      if (el) {
        if (hasReactiveTabExpose(el)) {
          setupComponentWatching(routeKey, el)
        } else if (typeof el === 'object' && '$' in el) {
          const internalExpose = (el as ReactiveTabExpose).$
          if (hasReactiveTabExpose(internalExpose)) {
            setupComponentWatching(routeKey, internalExpose)
          }
        }
      } else if (el === null) {
        cleanupComponentWatching(routeKey)
      }
    } catch (error) {
      console.error(`[RouterTab] Error handling component ref for ${routeKey}:`, error)
      cleanupComponentWatching(routeKey)
    }
  }

  function cleanupStaleWatchers() {
    const currentTabIds = new Set(controller.tabs.map(tab => tab.id))
    const instanceKeys = Array.from(componentInstances.keys())

    instanceKeys.forEach(key => {
      if (!currentTabIds.has(key)) {
        cleanupComponentWatching(key)
      }
    })
  }

  function cleanupAllWatchers() {
    watchedProperties.forEach((unwatchers) => {
      unwatchers.forEach(unwatcher => {
        try {
          unwatcher()
        } catch (error) {
          console.error('[RouterTab] Error during cleanup:', error)
        }
      })
    })
    watchedProperties.clear()
    componentInstances.clear()
  }

  function getReactiveTabTitle(tab: TabRecord): string {
    return reactiveTabTitles.value[tab.id] || getFallbackTitle(tab)
  }

  return {
    handleComponentRef,
    cleanupStaleWatchers,
    cleanupAllWatchers,
    getReactiveTabTitle
  }
}

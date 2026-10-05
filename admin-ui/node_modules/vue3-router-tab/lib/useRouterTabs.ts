import { getCurrentInstance, inject } from 'vue'
import type { RouterTabsContext } from './core/types'
import { routerTabsKey } from './constants'

export interface UseRouterTabsOptions {
  optional?: boolean
}

export function useRouterTabs(options: UseRouterTabsOptions = {}): RouterTabsContext | null {
  const { optional = false } = options

  const injected = inject(routerTabsKey, null)
  if (injected) return injected

  const legacy = inject<RouterTabsContext | null>('$tabs' as any, null)
  if (legacy) return legacy

  const instance = getCurrentInstance()
  const globalTabs = instance?.appContext.config.globalProperties.$tabs as RouterTabsContext | undefined
  if (globalTabs) return globalTabs

  if (!optional) {
    throw new Error('[RouterTabs] useRouterTabs must be used within <router-tab>.')
  }

  return null
}

export default useRouterTabs

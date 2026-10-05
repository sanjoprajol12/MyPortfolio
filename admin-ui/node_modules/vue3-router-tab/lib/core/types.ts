import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationRaw, RouteLocationNormalizedLoaded } from 'vue-router'

export type TransitionLike =
  | string
  | {
      name?: string
      mode?: 'in-out' | 'out-in' | 'default'
      appear?: boolean
      [key: string]: unknown
    }

export interface TabMeta {
  title?: string | [string, ...unknown[]]
  tips?: string | [string, ...unknown[]]
  icon?: string
  closable?: boolean
  tabClass?: string | string[] | Record<string, boolean>
  target?: string
  href?: string
}

export interface TabInput extends Partial<TabMeta> {
  to: RouteLocationRaw
  id?: string
  renderKey?: number
}

export interface TabRecord extends TabMeta {
  id: string
  to: RouteLocationRaw
  fullPath: string
  matched: RouteLocationNormalizedLoaded
  alive: boolean
  reusable: boolean
  renderKey: number
}

export type RouterTabsMenuPreset =
  | 'refresh'
  | 'refreshAll'
  | 'close'
  | 'closeLefts'
  | 'closeRights'
  | 'closeOthers'

export interface RouterTabsMenuContext {
  target: TabRecord
  controller: RouterTabsContext
}

export interface RouterTabsMenuItem {
  id: RouterTabsMenuPreset | string
  label?: string
  handler?: (ctx: RouterTabsMenuContext) => void | Promise<void>
  visible?: boolean | ((ctx: RouterTabsMenuContext) => boolean)
  enable?: boolean | ((ctx: RouterTabsMenuContext) => boolean)
}

export type RouterTabsMenuConfig = RouterTabsMenuPreset | RouterTabsMenuItem

export interface RouterTabsSnapshotTab {
  to: RouteLocationRaw
  title?: TabRecord['title']
  tips?: TabRecord['tips']
  icon?: TabRecord['icon']
  tabClass?: TabRecord['tabClass']
  closable?: boolean
  renderKey?: number
}

export interface RouterTabsSnapshot {
  tabs: RouterTabsSnapshotTab[]
  active?: RouteLocationRaw | null
}

export interface CloseTabOptions {
  redirect?: RouteLocationRaw | null
  force?: boolean
  refresh?: boolean | 'sameTab'
}

export interface RouterTabsOptions {
  initialTabs?: TabInput[]
  keepAlive?: boolean
  maxAlive?: number
  keepLastTab?: boolean
  appendPosition?: 'last' | 'next'
  defaultRoute?: RouteLocationRaw
}

export interface RouteMatchResult {
  key: string
  fullPath: string
  alive: boolean
  reusable: boolean
  matched: RouteLocationNormalizedLoaded
}

export interface RouterTabsContext {
  options: Required<RouterTabsOptions>
  tabs: TabRecord[]
  activeId: Ref<string | null>
  current: Ref<TabRecord | undefined>
  includeKeys: ComputedRef<string[]>
  refreshingKey: Ref<string | null>
  openTab: (target: RouteLocationRaw, replace?: boolean, refresh?: boolean | 'sameTab') => Promise<void>
  closeTab: (id?: string, options?: CloseTabOptions) => Promise<void>
  removeTab: (id: string, opts?: { redirect?: RouteLocationRaw | null; force?: boolean }) => Promise<void>
  refreshTab: (id?: string, force?: boolean) => Promise<void>
  refreshAll: (force?: boolean) => Promise<void>
  reset: (route?: RouteLocationRaw) => Promise<void>
  reload: () => Promise<void>
  getRouteKey: (route: RouteLocationNormalizedLoaded | RouteLocationRaw) => string
  matchRoute: (route: RouteLocationNormalizedLoaded | RouteLocationRaw) => RouteMatchResult
  snapshot: () => RouterTabsSnapshot
  hydrate: (snapshot: RouterTabsSnapshot) => Promise<void>
  setTabAlive: (id: string, alive: boolean) => void
  evictCache: (id: string) => void
  clearCache: () => void
  getCacheKeys: () => string[]
  ensureTab: (route: RouteLocationNormalizedLoaded) => TabRecord | undefined
}

export interface RouterTabsPersistenceStorage {
  read: (key: string) => string | null
  write: (key: string, value: string, options: RouterTabsPersistenceOptions) => void
  remove: (key: string, options: RouterTabsPersistenceOptions) => void
}

export interface RouterTabsPersistenceOptions {
  cookieKey?: string
  storage?: 'cookie' | 'localStorage' | RouterTabsPersistenceStorage
  debounceMs?: number
  expiresInDays?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  serialize?: (snapshot: RouterTabsSnapshot | null) => string
  deserialize?: (value: string | null) => RouterTabsSnapshot | null
  fallbackRoute?: RouteLocationRaw
}

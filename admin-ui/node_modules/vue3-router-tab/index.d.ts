import type { App, DefineComponent, Plugin, Ref, ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type {
  CloseTabOptions,
  RouterTabsContext,
  RouterTabsMenuConfig,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  RouterTabsOptions,
  RouterTabsPersistenceOptions,
  RouterTabsPersistenceStorage,
  RouterTabsSnapshot,
  RouterTabsSnapshotTab,
  TabInput,
  TabRecord,
  TransitionLike
} from './lib/core/types'
import type { ColorStyle, RouterTabsThemeOptions } from './lib/theme'

export interface RouterTabsPluginOptions {
  initTheme?: boolean
  themeOptions?: RouterTabsThemeOptions
  componentName?: string
  tabsComponentName?: string
}

export interface RouterTabProps {
  tabs?: TabInput[]
  keepAlive?: boolean
  maxAlive?: number
  keepLastTab?: boolean
  stickyHeader?: boolean
  append?: 'last' | 'next'
  defaultPage?: RouteLocationRaw
  tabTransition?: TransitionLike
  pageTransition?: TransitionLike
  contextMenu?: boolean | RouterTabsMenuConfig[]
  cookieKey?: string | null
  persistence?: RouterTabsPersistenceOptions | null
  sortable?: boolean
}

export interface ReactiveTabState {
  title?: string | Ref<string> | ComputedRef<string>
  icon?: string | Ref<string> | ComputedRef<string>
  closable?: boolean | Ref<boolean> | ComputedRef<boolean>
  meta?: Record<string, unknown> | Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>
}

export interface ReactiveTabReturn {
  routeTabTitle: Ref<string> | ComputedRef<string>
  routeTabIcon: Ref<string> | ComputedRef<string>
  routeTabClosable: Ref<boolean> | ComputedRef<boolean>
  routeTabMeta: Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>
  updateTitle: (title: string) => void
  updateIcon: (icon: string) => void
  updateClosable: (closable: boolean) => void
  updateMeta: (meta: Record<string, unknown>) => void
}

export type {
  CloseTabOptions,
  RouterTabsContext,
  RouterTabsMenuConfig,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  RouterTabsOptions,
  RouterTabsPersistenceOptions,
  RouterTabsPersistenceStorage,
  RouterTabsSnapshot,
  RouterTabsSnapshotTab,
  RouterTabsThemeOptions,
  TabInput,
  TabRecord,
  TransitionLike
}

export declare const routerTabsKey: import('vue').InjectionKey<RouterTabsContext>

export declare function useRouterTabs(options?: { optional?: boolean }): RouterTabsContext | null
export declare function useRouterTabsPersistence(options?: RouterTabsPersistenceOptions): {
  hydrating: Ref<boolean>
}

export declare function initRouterTabsTheme(options?: RouterTabsThemeOptions): void
export declare function setRouterTabsTheme(style: 'light' | 'dark' | 'system', options?: RouterTabsThemeOptions): void
export declare function setRouterTabsPrimary(color: ColorStyle, options?: RouterTabsThemeOptions): void

export declare function useReactiveTab(initialState?: ReactiveTabState): ReactiveTabReturn
export declare function useLoadingTab(loadingState: Ref<boolean>, baseTitle?: string): ReactiveTabReturn
export declare function useNotificationTab(
  count: Ref<number>,
  baseTitle?: string,
  baseIcon?: string
): ReactiveTabReturn
export declare function useStatusTab(
  status: Ref<'normal' | 'loading' | 'error' | 'success'>,
  baseTitle?: string
): ReactiveTabReturn

export declare const RouterTabs: DefineComponent<RouterTabsPersistenceOptions>
export declare const RouterTab: DefineComponent<RouterTabProps>

export type RouterTabPlugin = Plugin & {
  install: (app: App, options?: RouterTabsPluginOptions) => void
}

declare const plugin: RouterTabPlugin

export default plugin

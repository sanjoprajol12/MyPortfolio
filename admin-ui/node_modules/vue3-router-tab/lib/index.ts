import type { App, Plugin } from 'vue'
import RouterTab from './components/RouterTab.vue'
import RouterTabsComponent from './components/RouterTabs.vue'
import { routerTabsKey } from './constants'
import useRouterTabs from './useRouterTabs'
import { useRouterTabsPersistence } from './persistence'
import {
  initRouterTabsTheme,
  setRouterTabsPrimary,
  setRouterTabsTheme
} from './theme'

import type { RouterTabsContext } from './core/types'
import type { RouterTabsThemeOptions } from './theme'

export type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsPersistenceOptions,
  RouterTabsPersistenceStorage
} from './core/types'

export type { RouterTabsThemeOptions } from './theme'

export interface RouterTabsPluginOptions {
  /**
   * Whether to initialise the theme system automatically during install.
   * Defaults to `true`.
   */
  initTheme?: boolean
  /**
   * Theme options passed to `initRouterTabsTheme` when `initTheme` is enabled.
   */
  themeOptions?: RouterTabsThemeOptions
  /**
   * Global component name used when registering `RouterTab`.
   * Defaults to the component's `name` option or `"RouterTab"`.
   */
  componentName?: string
  /**
   * Global component name used when registering `RouterTabs`.
   * Defaults to the component's `name` option or `"RouterTabs"`.
   */
  tabsComponentName?: string
}

export {
  routerTabsKey,
  useRouterTabs,
  useRouterTabsPersistence,
  RouterTab,
  RouterTabsComponent as RouterTabs,
  initRouterTabsTheme,
  setRouterTabsTheme,
  setRouterTabsPrimary
}

export {
  useReactiveTab,
  useLoadingTab,
  useNotificationTab,
  useStatusTab
} from './useReactiveTab'

export type {
  ReactiveTabState,
  ReactiveTabReturn
} from './useReactiveTab'

import './scss/index.scss'

const installedApps = new WeakSet<App>()
const routerTabsGlobalStateKey = Symbol('RouterTabsGlobalState')

type RouterTabsGlobals = App['config']['globalProperties'] & {
  [routerTabsGlobalStateKey]?: RouterTabsContext | null
  $tabs?: RouterTabsContext | null
}

const plugin: Plugin = {
  install(app: App, options?: RouterTabsPluginOptions) {
    if (installedApps.has(app)) return
    installedApps.add(app)

    const {
      initTheme = true,
      themeOptions,
      componentName = RouterTab.name || 'RouterTab',
      tabsComponentName = RouterTabsComponent.name || 'RouterTabs'
    } = options ?? {}

    if (initTheme) {
      initRouterTabsTheme(themeOptions ?? {})
    }

    app.component(componentName, RouterTab)
    app.component(tabsComponentName, RouterTabsComponent)

    if (tabsComponentName.toLowerCase() !== 'router-tabs') {
      app.component('router-tabs', RouterTabsComponent)
    }

    const globals = app.config.globalProperties as RouterTabsGlobals

    Object.defineProperty(globals, '$tabs', {
      configurable: true,
      enumerable: false,
      get() {
        return globals[routerTabsGlobalStateKey] ?? null
      },
      set(value: RouterTabsContext | null) {
        globals[routerTabsGlobalStateKey] = value ?? null
        if (value !== null) {
          app.provide(routerTabsKey, value)
        }
      }
    })
  }
}

export default plugin

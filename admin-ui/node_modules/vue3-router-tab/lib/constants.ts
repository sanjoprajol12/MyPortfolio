import type { InjectionKey } from 'vue'
import type { RouterTabsContext } from './core/types'

export const routerTabsKey: InjectionKey<RouterTabsContext> = Symbol('RouterTabsContext')

export const routerTabsCookie = 'router-tabs:snapshot'

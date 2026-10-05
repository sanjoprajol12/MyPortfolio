/// <reference types="vite/client" />
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    action?: string
    subject?: string
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default'
    unauthenticatedOnly?: boolean
    superAdminOnly?: boolean
    public?: boolean
    title?: string
    icon?: string
    closable?: boolean
    reuse?: boolean
    keepAlive?: boolean
  }
}

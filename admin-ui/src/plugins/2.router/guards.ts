import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // The session cookie is invisible to scripts; ask the API once per page load
    if (!authStore.hasCheckedSession && !authStore.user?.id)
      await authStore.verifyAuth()

    const isLoggedIn = authStore.isAuthenticated && !!authStore.user?.id

    if (to.meta.unauthenticatedOnly && isLoggedIn)
      return next({ name: 'dashboard' })

    if (to.matched.some(record => record.meta.middleware === 'auth') && !isLoggedIn) {
      return next({
        name: 'login',
        query: { to: to.fullPath !== '/' ? to.fullPath : undefined },
      })
    }

    // Two-step verification is required before anything else can be used
    if (isLoggedIn && authStore.needsMfaSetup && !['security', 'account'].includes(String(to.name)))
      return next({ name: 'security' })

    // The API enforces this too; the guard only avoids rendering a page that would 403
    if (isLoggedIn && to.meta.superAdminOnly && !authStore.isSuperAdmin)
      return next({ name: 'forbidden' })

    return next()
  })
}

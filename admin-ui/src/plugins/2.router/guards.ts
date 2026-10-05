import type { Router } from 'vue-router'
import JwtService from '@/services/JwtService'
import { useAuthStore } from '@/store/auth'

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // The token survives a reload via localStorage while the user is still empty
    if (JwtService.getToken() && !authStore.user?.id)
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

    // The API enforces this too; the guard only avoids rendering a page that would 403
    if (isLoggedIn && to.meta.superAdminOnly && !authStore.isSuperAdmin)
      return next({ name: 'forbidden' })

    return next()
  })
}

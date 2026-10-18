import { defineStore } from 'pinia'
import AuthService from '@/services/portfolio/AuthService'
import type { AuthUser, UserCredentials } from '@/types/portfolio'

export const useAuthStore = defineStore('auth', () => {
  const errors = ref<string[]>([])
  const user = ref<AuthUser | null>(null)

  // The session is an httpOnly cookie the page cannot see, so the API is asked once per page
  // load whether it is still valid (see verifyAuth and the router guard)
  const isAuthenticated = ref(false)
  const hasCheckedSession = ref(false)

  // Set between a correct password and a correct two-step code; kept in memory only
  const pendingMfaToken = ref<string | null>(null)

  const authService = new AuthService()

  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')

  // The site requires two-step verification and this account has not set it up yet
  const needsMfaSetup = computed(() => Boolean(user.value?.mfaRequired && !user.value?.mfaEnabled))

  const setAuth = (authUser: AuthUser) => {
    isAuthenticated.value = true
    hasCheckedSession.value = true
    user.value = { ...user.value, ...authUser }
    errors.value = []
  }

  const setError = (error: any) => {
    errors.value = [error?.message || 'Something went wrong']
  }

  // Clears local session state; navigation is left to the caller / router guard.
  const purgeAuth = () => {
    isAuthenticated.value = false
    user.value = null
    errors.value = []
    pendingMfaToken.value = null
  }

  // Returns 'mfa' when the account needs a two-step code before it is signed in
  const login = async (credentials: UserCredentials): Promise<boolean | 'mfa'> => {
    try {
      const response = await authService.login(credentials)

      if ('mfaToken' in response) {
        pendingMfaToken.value = response.mfaToken
        errors.value = []

        return 'mfa'
      }

      setAuth({ ...response.user, mfaRequired: response.mfaRequired })

      return true
    }
    catch (error: any) {
      setError(error)

      return false
    }
  }

  const completeMfaLogin = async (code: string) => {
    if (!pendingMfaToken.value) {
      setError({ message: 'Your sign-in attempt expired. Please enter your password again.' })

      return false
    }

    try {
      const response = await authService.loginMfa(pendingMfaToken.value, code.trim())

      pendingMfaToken.value = null
      setAuth({ ...response.user, mfaRequired: response.mfaRequired })

      return true
    }
    catch (error: any) {
      // An expired challenge cannot be retried; send the user back to the password step
      if (error?.status === 401)
        pendingMfaToken.value = null
      setError(error)

      return false
    }
  }

  const cancelMfaLogin = () => {
    pendingMfaToken.value = null
    errors.value = []
  }

  // The API clears the session cookie
  const logout = async () => {
    try {
      await authService.logout()
    }
    catch {
      // Signed out locally either way; the cookie also expires on its own
    }
    purgeAuth()

    const { router } = await import('@/plugins/2.router')

    await router.push({ name: 'login' })
  }

  const verifyAuth = async () => {
    try {
      const { user: current } = await authService.session()

      if (current) {
        setAuth(current)
      }
      else {
        hasCheckedSession.value = true
        purgeAuth()
      }
    }
    catch {
      // A network error or a cold-starting API is retried on the next navigation
      purgeAuth()
    }
  }

  const setMfaEnabled = (enabled: boolean) => {
    if (user.value)
      user.value = { ...user.value, mfaEnabled: enabled }
  }

  return {
    errors,
    user,
    isAuthenticated,
    hasCheckedSession,
    isSuperAdmin,
    needsMfaSetup,
    pendingMfaToken,
    login,
    completeMfaLogin,
    cancelMfaLogin,
    logout,
    setAuth,
    purgeAuth,
    setError,
    verifyAuth,
    setMfaEnabled,
  }
})

import { defineStore } from 'pinia'
import JwtService from '@/services/JwtService'
import AuthService from '@/services/portfolio/AuthService'
import type { AuthUser, UserCredentials } from '@/types/portfolio'

export const useAuthStore = defineStore('auth', () => {
  const errors = ref<string[]>([])
  const user = ref<AuthUser | null>(null)

  // Set between a correct password and a correct two-step code; kept in memory only
  const pendingMfaToken = ref<string | null>(null)

  const jwtService = JwtService
  const authService = new AuthService()
  const isAuthenticated = ref(!!jwtService.getToken())

  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')

  const setAuth = (authUser: AuthUser, token?: string) => {
    isAuthenticated.value = true
    user.value = authUser
    errors.value = []
    if (token)
      jwtService.saveToken(token)
  }

  // Swaps in a fresh token after the API signed out older sessions
  const replaceToken = (token: string) => {
    jwtService.saveToken(token)
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
    jwtService.destroyToken()
  }

  // Returns 'mfa' when the account needs a two-step code before it is signed in
  const login = async (credentials: UserCredentials): Promise<boolean | 'mfa'> => {
    try {
      const response = await authService.login(credentials)

      if ('mfaRequired' in response) {
        pendingMfaToken.value = response.mfaToken
        errors.value = []

        return 'mfa'
      }

      setAuth(response.user, response.token)

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
      const { token, user: authUser } = await authService.loginMfa(pendingMfaToken.value, code.trim())

      pendingMfaToken.value = null
      setAuth(authUser, token)

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

  // Sessions are stateless JWTs, so signing out only clears the token
  const logout = async () => {
    purgeAuth()

    const { router } = await import('@/plugins/2.router')

    await router.push({ name: 'login' })
  }

  const verifyAuth = async () => {
    if (!jwtService.getToken()) {
      purgeAuth()

      return
    }

    try {
      setAuth(await authService.me())
    }
    catch (error: any) {
      // Only a rejected token ends the session. A network error or a cold-starting API
      // keeps the token so the next navigation can verify it again.
      if (error?.status === 401) {
        purgeAuth()

        return
      }

      isAuthenticated.value = false
      user.value = null
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
    isSuperAdmin,
    pendingMfaToken,
    login,
    completeMfaLogin,
    cancelMfaLogin,
    logout,
    setAuth,
    replaceToken,
    purgeAuth,
    setError,
    verifyAuth,
    setMfaEnabled,
  }
})


import { getCurrentInstance, inject } from 'vue'

type SnotifyLike = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

let fallbackSnotify: SnotifyLike | undefined

const { showValidationError } = useErrors()

export const initSnotifyHelper = (instance: SnotifyLike) => {
  fallbackSnotify = instance
}

const getSnotify = (): SnotifyLike | undefined => {
  const inst = getCurrentInstance()
  if (inst) {
    // If you actually provide via app.provide('vue3-notify', snotify)
    const injected = inject<SnotifyLike>('vue3-notify')
    if (injected) return injected

    // Or via globalProperties.$snotify
    const gp = (inst.appContext.config.globalProperties as any) || {}
    const globalSnotify = gp.$snotify as SnotifyLike | undefined
    if (globalSnotify) return globalSnotify
  }
  
  return fallbackSnotify
}

export const showSuccess = (message: string) => {
  getSnotify()?.success(message)
}

export const showInfo = (message: string) => {
  getSnotify()?.info(message)
}

export const showErrorMsg = (message: string) => {
  getSnotify()?.error(message)
}

export const showError = (error: any) => {
  if (typeof error === 'string')
    return showErrorMsg(error)

  // Axios error compatibility (BaseAPIService already normalises to { message, status, data })
  const resp = error?.response ?? error
  const status = resp?.status
  const data = resp?.data ?? {}

  // Prefer backend messages when present — the portfolio API responds with { error }
  const backendMessage = data?.error || data?.message || error?.message

  if (status === 401)
    return showErrorMsg(backendMessage || 'Your session has expired. Please log in again.')

  if (status === 403)
    return showErrorMsg(backendMessage || 'You do not have permission to do that.')

  if (status === 404)
    return showErrorMsg(backendMessage || 'Not found')

  if (status === 400 || status === 422) {
    if (data?.errors)
      showValidationError(data.errors)

    return showErrorMsg(backendMessage || 'Please check the form and try again.')
  }

  return showErrorMsg(backendMessage || 'Something went wrong. Please try again.')
}

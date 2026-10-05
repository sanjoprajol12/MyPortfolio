import { inject, getCurrentInstance } from 'vue'
import type { ConfirmFunction } from 'vue3-confirm-dialog-box'

export function useConfirm(): ConfirmFunction | undefined {
  const injectedConfirm = inject<ConfirmFunction>('vue3-confirm-dialog-box')
  if (injectedConfirm) {
    return injectedConfirm
  }

  const instance = getCurrentInstance()

  return instance?.appContext.config.globalProperties.$confirm
}

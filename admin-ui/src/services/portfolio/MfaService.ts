import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type { MfaSetup, MfaStatus } from '@/types/portfolio'

/** Two-step verification (authenticator app) for the signed-in admin. */
export default class MfaService extends BaseAPIService {
  constructor() {
    super('admin/mfa')
  }

  status() {
    return this.get<MfaStatus>()
  }

  setup() {
    return this.post<MfaSetup>({}, 'setup')
  }

  activate(code: string) {
    return this.post<{ recoveryCodes: string[] }>({ code }, 'activate')
  }

  disable(currentPassword: string) {
    return this.post<APIResponseOk>({ currentPassword }, 'disable')
  }

  regenerateRecoveryCodes(currentPassword: string) {
    return this.post<{ recoveryCodes: string[] }>({ currentPassword }, 'recovery-codes')
  }
}

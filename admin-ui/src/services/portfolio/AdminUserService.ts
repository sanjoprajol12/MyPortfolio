import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type { AccountUpdateResponse, AdminUserPayload, AuthUser } from '@/types/portfolio'

/** Admin account management (super admins only). */
export default class AdminUserService extends BaseAPIService {
  constructor() {
    super('admin/users')
  }

  list() {
    return this.get<AuthUser[]>()
  }

  store(data: AdminUserPayload) {
    return this.post<AuthUser>(data)
  }

  update(id: string, data: Partial<AdminUserPayload>) {
    return this.put<AccountUpdateResponse>(data, encodeURIComponent(id))
  }

  resetMfa(id: string) {
    return this.delete<APIResponseOk>(`${encodeURIComponent(id)}/mfa`)
  }

  destroy(id: string) {
    return this.delete<APIResponseOk>(encodeURIComponent(id))
  }
}

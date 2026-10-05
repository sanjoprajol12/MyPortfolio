import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type { Message } from '@/types/portfolio'

export default class MessageService extends BaseAPIService {
  constructor() {
    super('admin/messages')
  }

  list() {
    return this.get<Message[]>()
  }

  markRead(id: string) {
    return this.patch<Message>({}, `${encodeURIComponent(id)}/read`)
  }

  destroy(id: string) {
    return this.delete<APIResponseOk>(encodeURIComponent(id))
  }
}

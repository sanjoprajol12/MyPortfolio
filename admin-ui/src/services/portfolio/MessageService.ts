import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type { Message, MessagePage, MessageQuery } from '@/types/portfolio'

export default class MessageService extends BaseAPIService {
  constructor() {
    super('admin/messages')
  }

  // Paginated and filtered on the server
  list(params: MessageQuery = {}) {
    return this.query<MessagePage>('', { params })
  }

  markSpam(id: string, spam: boolean) {
    return this.patch<Message>({ spam }, `${encodeURIComponent(id)}/spam`)
  }

  markRead(id: string) {
    return this.patch<Message>({}, `${encodeURIComponent(id)}/read`)
  }

  destroy(id: string) {
    return this.delete<APIResponseOk>(encodeURIComponent(id))
  }
}

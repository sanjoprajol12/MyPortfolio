import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseOk } from '@/types/APIResponse'
import type { Ordered } from '@/types/portfolio'

/** CRUD for the ordered collections under /admin (skills, experience, projects). */
export default class CollectionService<T extends Ordered> extends BaseAPIService {
  constructor(resource: 'skills' | 'experience' | 'projects') {
    super(`admin/${resource}`)
  }

  list() {
    return this.get<T[]>()
  }

  store(data: Partial<T>) {
    return this.post<T>(data)
  }

  update(id: string, data: Partial<T>) {
    return this.put<T>(data, encodeURIComponent(id))
  }

  destroy(id: string) {
    return this.delete<APIResponseOk>(encodeURIComponent(id))
  }

  /** There is no bulk reorder endpoint: save the new `order` of every row whose position changed. */
  async saveOrder(sorted: T[]) {
    const changed = sorted
      .map((item, index) => ({ item, order: index + 1 }))
      .filter(({ item, order }) => item.order !== order)

    await Promise.all(changed.map(({ item, order }) => this.update(item._id, { order } as Partial<T>)))
  }
}

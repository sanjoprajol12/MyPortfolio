import BaseAPIService from '@/services/BaseAPIService'
import type { Overview, Site } from '@/types/portfolio'

export default class SiteService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  overview() {
    return this.get<Overview>('overview')
  }

  show() {
    return this.get<Site | null>('site')
  }

  /**
   * PUT /admin/site runs findOneAndUpdate with the body, so a nested object replaces the
   * whole sub-document. Callers send dotted paths (e.g. "hero.eyebrow") to change only the
   * fields on their form; the uploaded photo in hero.photoUrl is never sent back.
   */
  update(fields: Record<string, unknown>) {
    return this.put<Site>(fields, 'site')
  }

  uploadPhoto(file: File) {
    const formData = new FormData()

    formData.append('photo', file)

    return this.post<{ photoUrl: string }>(formData, 'upload')
  }
}

// Turns { hero: { eyebrow: 'x' } } into { 'hero.eyebrow': 'x' } so only those paths are $set
export const toDottedPaths = (prefix: string, values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [`${prefix}.${key}`, value]))

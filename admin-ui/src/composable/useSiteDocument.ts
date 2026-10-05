import SiteService from '@/services/portfolio/SiteService'
import type { Site } from '@/types/portfolio'

/** Loads the single site document for the content forms and saves selected paths back. */
export function useSiteDocument(onLoad: (site: Partial<Site>) => void) {
  const siteService = new SiteService()

  const isLoading = ref(false)
  const isSaving = ref(false)

  const load = async () => {
    isLoading.value = true
    try {
      onLoad((await siteService.show()) ?? {})
    }
    catch (error) {
      showError(error)
    }
    finally {
      isLoading.value = false
    }
  }

  const save = async (fields: Record<string, unknown>, successMessage: string) => {
    isSaving.value = true
    try {
      onLoad(await siteService.update(fields))
      showSuccess(successMessage)
    }
    catch (error) {
      showError(error)
    }
    finally {
      isSaving.value = false
    }
  }

  onMounted(load)

  return { isLoading, isSaving, load, save }
}

import CollectionService from '@/services/portfolio/CollectionService'
import type { Ordered } from '@/types/portfolio'

/** List, drag-sort and delete for skills, experience and projects. */
export function useOrderedCollection<T extends Ordered>(resource: 'skills' | 'experience' | 'projects') {
  const service = new CollectionService<T>(resource)
  const $confirm = useConfirm()

  const isLoading = ref(false)
  const items = ref<T[]>([]) as Ref<T[]>

  // New entries go to the end of the list
  const nextOrder = computed(() => Math.max(0, ...items.value.map(item => item.order ?? 0)) + 1)

  const fetchItems = async () => {
    isLoading.value = true
    try {
      items.value = await service.list()
    }
    catch (error) {
      showError(error)
      items.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  const saveOrder = async (sorted: T[]) => {
    try {
      await service.saveOrder(sorted)
      showSuccess('Order saved')
    }
    catch (error) {
      showError(error)
    }
    finally {
      fetchItems()
    }
  }

  const confirmDelete = (item: T, message: string, successMessage: string) => {
    $confirm?.({
      message,
      button: { no: 'No', yes: 'Yes' },
      callback: async (ok: boolean) => {
        if (!ok) return
        try {
          await service.destroy(item._id)
          showSuccess(successMessage)
          fetchItems()
        }
        catch (error) {
          showError(error)
        }
      },
    })
  }

  onMounted(fetchItems)

  return { service, isLoading, items, nextOrder, fetchItems, saveOrder, confirmDelete }
}

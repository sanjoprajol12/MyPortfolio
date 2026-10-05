import {
  ref,
  computed,
  isRef,
  isReadonly,
  type Ref,
  type ComputedRef
} from 'vue'

export interface ReactiveTabState {
  title?: string | Ref<string> | ComputedRef<string>
  icon?: string | Ref<string> | ComputedRef<string>
  closable?: boolean | Ref<boolean> | ComputedRef<boolean>
  meta?: any | Ref<any> | ComputedRef<any>
}

export interface ReactiveTabReturn {
  routeTabTitle: Ref<string> | ComputedRef<string>
  routeTabIcon: Ref<string> | ComputedRef<string>
  routeTabClosable: Ref<boolean> | ComputedRef<boolean>
  routeTabMeta: Ref<any> | ComputedRef<any>
  updateTitle: (title: string) => void
  updateIcon: (icon: string) => void
  updateClosable: (closable: boolean) => void
  updateMeta: (meta: any) => void
}

/**
 * Composable for managing reactive tab properties
 * RouterTab will automatically watch these properties and update the tab accordingly
 */
function resolveReactiveProp<T>(
  source: T | Ref<T> | ComputedRef<T> | (() => T) | undefined,
  fallback: T
): {
  value: Ref<T> | ComputedRef<T>
  update: (value: T) => void
} {
  if (isRef(source)) {
    const writable = !isReadonly(source)
    return {
      value: source,
      update: writable ? (value: T) => { (source as Ref<T>).value = value } : () => {}
    }
  }

  if (typeof source === 'function') {
    const getter = source as () => T
    return {
      value: computed(getter),
      update: () => {}
    }
  }

  const state = ref(
    (source === undefined ? fallback : source) as T
  ) as Ref<T>

  return {
    value: state,
    update: (value: T) => {
      state.value = value
    }
  }
}

export function useReactiveTab(initialState: ReactiveTabState = {}): ReactiveTabReturn {
  const title = resolveReactiveProp(initialState.title, 'Untitled')
  const icon = resolveReactiveProp(initialState.icon, '')
  const closable = resolveReactiveProp(initialState.closable, true)
  const meta = resolveReactiveProp(initialState.meta, {})

  return {
    routeTabTitle: title.value,
    routeTabIcon: icon.value,
    routeTabClosable: closable.value,
    routeTabMeta: meta.value,
    updateTitle: title.update,
    updateIcon: icon.update,
    updateClosable: closable.update,
    updateMeta: meta.update
  }
}

/**
 * Preset for loading state tabs
 */
export function useLoadingTab(loadingState: Ref<boolean>, baseTitle = 'Page') {
  return useReactiveTab({
    title: computed(() => loadingState.value ? 'Loading...' : baseTitle),
    icon: computed(() => loadingState.value ? 'mdi-loading mdi-spin' : 'mdi-page'),
    closable: computed(() => !loadingState.value)
  })
}

/**
 * Preset for notification-aware tabs
 */
export function useNotificationTab(
  count: Ref<number>, 
  baseTitle = 'Page',
  baseIcon = 'mdi-page'
) {
  return useReactiveTab({
    title: computed(() => count.value > 0 ? `${baseTitle} (${count.value})` : baseTitle),
    icon: computed(() => count.value > 0 ? 'mdi-bell-badge' : baseIcon)
  })
}

/**
 * Preset for status-aware tabs
 */
export function useStatusTab(
  status: Ref<'normal' | 'loading' | 'error' | 'success'>,
  baseTitle = 'Page'
) {
  const statusConfig = {
    normal: { suffix: '', icon: 'mdi-page' },
    loading: { suffix: ' - Loading', icon: 'mdi-loading mdi-spin' },
    error: { suffix: ' - Error', icon: 'mdi-alert' },
    success: { suffix: ' - Success', icon: 'mdi-check-circle' }
  }

  return useReactiveTab({
    title: computed(() => baseTitle + statusConfig[status.value].suffix),
    icon: computed(() => statusConfig[status.value].icon),
    closable: computed(() => status.value !== 'loading')
  })
}


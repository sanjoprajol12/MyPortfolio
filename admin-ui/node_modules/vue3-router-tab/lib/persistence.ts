import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRouterTabs } from './useRouterTabs'
import type {
  RouterTabsPersistenceOptions,
  RouterTabsPersistenceStorage,
  RouterTabsSnapshot
} from './core/types'
import { routerTabsCookie } from './constants'

const DAY_IN_MS = 86_400_000

function readCookie(key: string): string | null {
  if (typeof document === 'undefined') return null
  const encodedKey = `${encodeURIComponent(key)}=`
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const cookie of cookies) {
    if (cookie.startsWith(encodedKey)) {
      return decodeURIComponent(cookie.slice(encodedKey.length))
    }
  }
  return null
}

function writeCookie(key: string, value: string, options: RouterTabsPersistenceOptions) {
  if (typeof document === 'undefined') return

  const {
    expiresInDays = 7,
    path = '/',
    domain,
    secure,
    sameSite = 'lax'
  } = options

  const parts = [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`]

  if (expiresInDays !== Infinity) {
    const expires = new Date(Date.now() + expiresInDays * DAY_IN_MS).toUTCString()
    parts.push(`Expires=${expires}`)
  }

  if (path) parts.push(`Path=${path}`)
  if (domain) parts.push(`Domain=${domain}`)
  if (secure) parts.push('Secure')
  if (sameSite) parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`)

  document.cookie = parts.join('; ')
}

function removeCookie(key: string, options: RouterTabsPersistenceOptions) {
  if (typeof document === 'undefined') return

  const { path = '/', domain } = options
  const parts = [`${encodeURIComponent(key)}=`]
  parts.push('Expires=Thu, 01 Jan 1970 00:00:01 GMT')
  if (path) parts.push(`Path=${path}`)
  if (domain) parts.push(`Domain=${domain}`)

  document.cookie = parts.join('; ')
}

const cookieStorage: RouterTabsPersistenceStorage = {
  read: readCookie,
  write: writeCookie,
  remove: removeCookie
}

const localStorageBackend: RouterTabsPersistenceStorage = {
  read(key) {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  },
  write(key, value) {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
  },
  remove(key) {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
  }
}

function resolveStorage(storage: RouterTabsPersistenceOptions['storage']): RouterTabsPersistenceStorage {
  if (!storage || storage === 'cookie') return cookieStorage
  if (storage === 'localStorage') return localStorageBackend
  return storage
}

const defaultSerialize = (snapshot: RouterTabsSnapshot | null) => JSON.stringify(snapshot ?? null)
const defaultDeserialize = (value: string | null): RouterTabsSnapshot | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as RouterTabsSnapshot
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn('[RouterTabs] Failed to parse cookie snapshot', error)
    }
    return null
  }
}

export function useRouterTabsPersistence(options: RouterTabsPersistenceOptions = {}) {
  const {
    cookieKey = routerTabsCookie,
    debounceMs = 0,
    storage: storageOption,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize
  } = options

  const controller = useRouterTabs({ optional: true })
  // Start as `true` so pages won't mount until hydration decides what to do.
  // This prevents double-mount / double-fetch on initial load when restoring tabs.
  const hydrating = ref(true)
  const storage = resolveStorage(storageOption)
  let writeTimer: ReturnType<typeof setTimeout> | null = null

  function clearWriteTimer() {
    if (writeTimer === null) return
    clearTimeout(writeTimer)
    writeTimer = null
  }

  const setup = (ctrl: NonNullable<typeof controller>, mode: 'hook' | 'immediate' = 'hook') => {
    const persistSnapshot = () => {
      const snapshot = ctrl.snapshot()
      if (!snapshot.tabs.length) {
        storage.remove(cookieKey, options)
      } else {
        storage.write(cookieKey, serialize(snapshot), options)
      }
    }

    const schedulePersistSnapshot = () => {
      if (debounceMs <= 0) {
        persistSnapshot()
        return
      }

      clearWriteTimer()
      writeTimer = setTimeout(() => {
        writeTimer = null
        persistSnapshot()
      }, debounceMs)
    }

    const run = async () => {
      hydrating.value = true

      try {
        const initialSnapshot = deserialize(storage.read(cookieKey))

        if (initialSnapshot && initialSnapshot.tabs?.length) {
          await ctrl.hydrate(initialSnapshot)
          if (initialSnapshot.active) {
            await nextTick()
            const activeTab = ctrl.tabs.find(t => t.to === initialSnapshot.active)
            if (activeTab) {
              ctrl.activeId.value = activeTab.id
              ctrl.current.value = activeTab
            }
          }
        } else if (Object.prototype.hasOwnProperty.call(options, 'fallbackRoute')) {
          const fallback = options.fallbackRoute ?? ctrl.options.defaultRoute
          await ctrl.reset(fallback)
        }

        persistSnapshot()
      } finally {
        hydrating.value = false
      }
    }

    if (mode === 'immediate') {
      void run()
    } else {
      // Run before the first paint to avoid mounting pages twice during a restore.
      onBeforeMount(() => {
        void run()
      })
    }

    watch(
      () => ({
        tabs: ctrl.tabs.map(tab => ({
          to: tab.to,
          title: tab.title,
          tips: tab.tips,
          icon: tab.icon,
          tabClass: tab.tabClass,
          closable: tab.closable,
          renderKey: tab.renderKey
        })),
        active: ctrl.activeId.value
      }),
      () => {
        if (hydrating.value) return
        schedulePersistSnapshot()
      },
      { deep: true }
    )
  }

  onBeforeUnmount(() => {
    clearWriteTimer()
  })

  if (controller) {
    setup(controller)
  } else {
    onMounted(() => {
      const lateController = useRouterTabs({ optional: true })
      if (lateController) {
        setup(lateController, 'immediate')
      } else if (import.meta.env?.DEV) {
        console.warn('[RouterTabs] Persistence helper must be used inside <router-tab>.')
      }
    })
  }

  return { hydrating: hydrating as Ref<boolean> }
}

export default useRouterTabsPersistence

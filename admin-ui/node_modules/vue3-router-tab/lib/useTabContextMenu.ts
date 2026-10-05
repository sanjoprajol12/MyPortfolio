import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import type {
  RouterTabsContext,
  RouterTabsMenuConfig,
  RouterTabsMenuContext,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  TabRecord
} from './core/types'

export interface ResolvedMenuItem {
  id: string
  label: string
  disabled: boolean
  action: () => Promise<void>
}

type BuiltinMenuItem = {
  label: string
  handler: (ctx: RouterTabsMenuContext) => void | Promise<void>
  enable?: (ctx: RouterTabsMenuContext) => boolean
  visible?: (ctx: RouterTabsMenuContext) => boolean
}

const defaultMenuOrder: RouterTabsMenuPreset[] = [
  'refresh',
  'refreshAll',
  'close',
  'closeLefts',
  'closeRights',
  'closeOthers'
]

export function useTabContextMenu(
  controller: RouterTabsContext,
  getContextMenu: () => boolean | RouterTabsMenuConfig[],
  isClosable: (tab: TabRecord) => boolean
) {
  const context = reactive({
    visible: false,
    target: null as TabRecord | null,
    position: { x: 0, y: 0 }
  })

  const menuRef = ref<HTMLElement | null>(null)
  const menuItemRefs = ref<(HTMLElement | null)[]>([])
  const highlightedIndex = ref(-1)

  function getTabIndex(id: string) {
    return controller.tabs.findIndex(item => item.id === id)
  }

  function getLeftTabs(tab: TabRecord) {
    const idx = getTabIndex(tab.id)
    return idx > 0 ? controller.tabs.slice(0, idx) : []
  }

  function getRightTabs(tab: TabRecord) {
    const idx = getTabIndex(tab.id)
    return idx > -1 ? controller.tabs.slice(idx + 1) : []
  }

  function getOtherTabs(tab: TabRecord) {
    return controller.tabs.filter(item => item.id !== tab.id)
  }

  async function closeTabsGroup(tabsToClose: TabRecord[], reference: TabRecord) {
    const closable = tabsToClose.filter(item => item.closable !== false)
    if (!closable.length) return

    for (const tab of closable) {
      if (controller.activeId.value === tab.id) {
        await controller.closeTab(tab.id, { redirect: reference.to, force: true })
      } else {
        await controller.removeTab(tab.id, { force: true })
      }
    }

    if (controller.activeId.value !== reference.id) {
      await controller.openTab(reference.to, true, false)
    }
  }

  const builtinMenu: Record<RouterTabsMenuPreset, BuiltinMenuItem> = {
    refresh: {
      label: 'Refresh',
      handler: async ({ target }) => {
        await controller.refreshTab(target.id, true)
      }
    },
    refreshAll: {
      label: 'Refresh All',
      handler: async () => {
        await controller.refreshAll(true)
      }
    },
    close: {
      label: 'Close',
      handler: async ({ target }) => {
        await controller.closeTab(target.id)
      },
      enable: ({ target }) => isClosable(target)
    },
    closeLefts: {
      label: 'Close to the Left',
      handler: async ({ target }) => {
        await closeTabsGroup(getLeftTabs(target), target)
      },
      enable: ({ target }) => getLeftTabs(target).some(tab => tab.closable !== false)
    },
    closeRights: {
      label: 'Close to the Right',
      handler: async ({ target }) => {
        await closeTabsGroup(getRightTabs(target), target)
      },
      enable: ({ target }) => getRightTabs(target).some(tab => tab.closable !== false)
    },
    closeOthers: {
      label: 'Close Others',
      handler: async ({ target }) => {
        await closeTabsGroup(getOtherTabs(target), target)
      },
      enable: ({ target }) => getOtherTabs(target).some(tab => tab.closable !== false)
    }
  }

  function hideContextMenu() {
    context.visible = false
    context.target = null
    highlightedIndex.value = -1
    menuItemRefs.value = []
  }

  function adjustMenuPosition() {
    const menuEl = menuRef.value
    if (!menuEl) return
    const margin = 8
    const { innerWidth, innerHeight } = window
    const rect = menuEl.getBoundingClientRect()

    let nextX = context.position.x
    let nextY = context.position.y

    if (rect.right > innerWidth - margin) {
      nextX = Math.max(margin, innerWidth - rect.width - margin)
    }

    if (rect.bottom > innerHeight - margin) {
      nextY = Math.max(margin, innerHeight - rect.height - margin)
    }

    if (nextX !== context.position.x || nextY !== context.position.y) {
      context.position.x = nextX
      context.position.y = nextY
    }
  }

  function showContextMenu(tab: TabRecord, event: MouseEvent) {
    if (!getContextMenu()) return

    context.target = tab
    context.position.x = event.clientX
    context.position.y = event.clientY

    nextTick(() => {
      context.visible = true
      document.addEventListener('click', hideContextMenu, { once: true })
      nextTick(() => {
        adjustMenuPosition()
      })
    })
  }

  function normalizeMenuItem(
    raw: RouterTabsMenuConfig,
    ctx: RouterTabsMenuContext
  ): ResolvedMenuItem | null {
    const config: RouterTabsMenuItem = typeof raw === 'string' ? { id: raw } : raw
    const builtin = builtinMenu[config.id as RouterTabsMenuPreset]

    const label = config.label ?? builtin?.label ?? String(config.id)

    const visibleResolver = config.visible ?? builtin?.visible ?? true
    const isVisible = typeof visibleResolver === 'function' ? visibleResolver(ctx) : visibleResolver !== false
    if (!isVisible) return null

    const enableResolver = config.enable ?? builtin?.enable ?? true
    const isEnabled = typeof enableResolver === 'function' ? enableResolver(ctx) : enableResolver !== false

    const sourceHandler = config.handler ?? builtin?.handler
    if (!sourceHandler) return null

    const action = async () => {
      await Promise.resolve(sourceHandler(ctx))
    }

    return {
      id: String(config.id),
      label,
      disabled: !isEnabled,
      action
    }
  }

  const menuItems = computed<ResolvedMenuItem[]>(() => {
    const contextMenu = getContextMenu()
    if (!context.visible || !context.target || contextMenu === false) return []

    const source = Array.isArray(contextMenu) ? contextMenu : defaultMenuOrder
    const ctx: RouterTabsMenuContext = { target: context.target, controller }

    return source
      .map(item => normalizeMenuItem(item, ctx))
      .filter((item): item is ResolvedMenuItem => !!item)
  })

  function setMenuItemRef(el: unknown, index: number) {
    menuItemRefs.value[index] = (el as HTMLElement) ?? null
  }

  function focusMenuItem(index: number) {
    if (index < 0) return
    const el = menuItemRefs.value[index]
    el?.focus({ preventScroll: true })
  }

  function findNextEnabledIndex(start: number, step: 1 | -1, items = menuItems.value): number {
    if (!items.length) return -1
    const total = items.length
    let idx = start

    for (let i = 0; i < total; i++) {
      idx = (idx + step + total) % total
      if (!items[idx].disabled) return idx
    }

    return -1
  }

  function highlightMenuIndex(index: number) {
    highlightedIndex.value = index
    if (index < 0) return
    nextTick(() => focusMenuItem(index))
  }

  function moveHighlight(step: 1 | -1) {
    const nextIndex = findNextEnabledIndex(highlightedIndex.value, step)
    if (nextIndex !== -1) {
      highlightMenuIndex(nextIndex)
    }
  }

  function onMenuKeydown(event: KeyboardEvent) {
    if (!context.visible) return

    const key = event.key
    const items = menuItems.value
    if (!items.length) return

    if (key === 'Tab') {
      hideContextMenu()
      return
    }

    const handledKeys = [
      'ArrowDown',
      'ArrowUp',
      'ArrowRight',
      'ArrowLeft',
      'Home',
      'End',
      'Enter',
      ' ',
      'Spacebar',
      'Escape'
    ]

    if (!handledKeys.includes(key)) return

    event.preventDefault()

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        moveHighlight(1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        moveHighlight(-1)
        break
      case 'Home':
        highlightMenuIndex(findNextEnabledIndex(-1, 1))
        break
      case 'End':
        highlightMenuIndex(findNextEnabledIndex(items.length, -1))
        break
      case 'Enter':
      case ' ':
      case 'Spacebar': {
        const index = highlightedIndex.value
        if (index > -1) {
          const item = items[index]
          if (!item.disabled) {
            handleMenuAction(item)
          }
        }
        break
      }
      case 'Escape':
        hideContextMenu()
        break
    }
  }

  async function handleMenuAction(item: ResolvedMenuItem) {
    if (item.disabled) return
    hideContextMenu()
    await item.action()
  }

  onMounted(() => {
    document.addEventListener('keydown', hideContextMenu)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', hideContextMenu)
  })

  watch(
    () => controller.activeId.value,
    () => {
      hideContextMenu()
    }
  )

  watch(getContextMenu, value => {
    if (!value) hideContextMenu()
  })

  watch(
    () => menuItems.value.length,
    length => {
      if (context.visible && length === 0) {
        hideContextMenu()
      }
    },
    { flush: 'post' }
  )

  watch(menuItems, items => {
    if (!context.visible) return
    menuItemRefs.value = new Array(items.length).fill(null)
    const first = findNextEnabledIndex(-1, 1, items)
    highlightMenuIndex(first)
  }, { flush: 'post' })

  watch(
    () => context.visible,
    visible => {
      if (!visible) {
        highlightedIndex.value = -1
        menuItemRefs.value = []
      }
    }
  )

  return {
    context,
    menuRef,
    highlightedIndex,
    menuItems,
    handleMenuAction,
    showContextMenu,
    hideContextMenu,
    setMenuItemRef,
    onMenuKeydown,
    highlightMenuIndex
  }
}

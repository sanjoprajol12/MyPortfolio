import { nextTick, ref, watch } from 'vue'
import type { RouterTabsContext, TabRecord } from './core/types'

export function useTabNavigation(
  controller: RouterTabsContext,
  close: (tab: TabRecord) => Promise<void>,
  isClosable: (tab: TabRecord) => boolean
) {
  const scrollContainer = ref<HTMLElement | null>(null)
  const tabRefs = new Map<string, HTMLElement>()

  function setTabRef(tabId: string, el: HTMLElement | null) {
    if (el) {
      tabRefs.set(tabId, el)
    } else {
      tabRefs.delete(tabId)
    }
  }

  function scrollTabIntoView(tabId: string) {
    nextTick(() => {
      const tabEl = tabRefs.get(tabId)
      const container = scrollContainer.value

      if (tabEl && container) {
        const tabRect = tabEl.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const isOutOfView = tabRect.left < containerRect.left || tabRect.right > containerRect.right

        if (isOutOfView) {
          tabEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }
    })
  }

  function focusTabByIndex(index: number) {
    const tab = controller.tabs[index]
    if (!tab) return
    tabRefs.get(tab.id)?.focus({ preventScroll: true })
  }

  async function activateTabByIndex(index: number) {
    const tab = controller.tabs[index]
    if (!tab) return
    await controller.openTab(tab.to, false)
    focusTabByIndex(index)
  }

  function activate(tab: TabRecord) {
    if (tab.href && typeof window !== 'undefined') {
      if (tab.target && tab.target !== '_self') {
        window.open(tab.href as string, tab.target)
      } else {
        window.location.assign(tab.href as string)
      }
      return
    }

    if (controller.activeId.value === tab.id) return
    controller.openTab(tab.to, false)
    scrollTabIntoView(tab.id)
  }

  async function onTabKeydown(tab: TabRecord, index: number, event: KeyboardEvent) {
    const lastIndex = controller.tabs.length - 1
    let nextIndex = index

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        nextIndex = index >= lastIndex ? 0 : index + 1
        await activateTabByIndex(nextIndex)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        nextIndex = index <= 0 ? lastIndex : index - 1
        await activateTabByIndex(nextIndex)
        break
      case 'Home':
        event.preventDefault()
        await activateTabByIndex(0)
        break
      case 'End':
        event.preventDefault()
        await activateTabByIndex(lastIndex)
        break
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault()
        activate(tab)
        break
      case 'Delete':
      case 'Backspace':
        if (isClosable(tab)) {
          event.preventDefault()
          await close(tab)
        }
        break
    }
  }

  watch(
    () => controller.activeId.value,
    (newActiveId) => {
      if (newActiveId) {
        scrollTabIntoView(newActiveId)
      }
    }
  )

  return {
    scrollContainer,
    setTabRef,
    scrollTabIntoView,
    activate,
    onTabKeydown
  }
}

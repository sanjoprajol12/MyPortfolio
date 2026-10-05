import { reactive } from 'vue'
import type { TabRecord } from './core/types'

export interface TabSortStartPayload {
  tab: TabRecord
  index: number
}

export interface TabSortedPayload {
  tab: TabRecord
  fromIndex: number
  toIndex: number
}

type TabSortEmit = {
  (event: 'tab-sort', payload: TabSortStartPayload): void
  (event: 'tab-sorted', payload: TabSortedPayload): void
}

export function useTabDragSort(
  tabs: TabRecord[],
  isSortable: () => boolean,
  emit: TabSortEmit
) {
  const dragState = reactive({
    dragging: false,
    dragIndex: -1,
    dropIndex: -1,
    dragTab: null as TabRecord | null
  })

  function onDragStart(tab: TabRecord, index: number, event: DragEvent) {
    if (!isSortable()) return

    dragState.dragging = true
    dragState.dragIndex = index
    dragState.dragTab = tab

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', tab.id)
    }

    emit('tab-sort', { tab, index })
  }

  function onDragOver(index: number, event: DragEvent) {
    if (!isSortable() || !dragState.dragging) return
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function onDragEnter(index: number) {
    if (!isSortable() || !dragState.dragging) return
    dragState.dropIndex = index
  }

  function onDragLeave() {
    if (!isSortable() || !dragState.dragging) return
  }

  function onDrop(index: number, event: DragEvent) {
    if (!isSortable() || !dragState.dragging) return

    event.preventDefault()

    if (dragState.dragIndex !== -1 && dragState.dragIndex !== index) {
      const movedTab = tabs.splice(dragState.dragIndex, 1)[0]
      tabs.splice(index, 0, movedTab)

      emit('tab-sorted', {
        tab: movedTab,
        fromIndex: dragState.dragIndex,
        toIndex: index
      })
    }

    onDragEnd()
  }

  function onDragEnd() {
    dragState.dragging = false
    dragState.dragIndex = -1
    dragState.dropIndex = -1
    dragState.dragTab = null
  }

  return {
    dragState,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragEnd
  }
}

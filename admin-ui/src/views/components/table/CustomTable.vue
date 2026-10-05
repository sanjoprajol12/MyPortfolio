<template>
  <div 
    class="custom-table-wrapper"
    :class="{
      'striped': striped,
      'hover': hover,
      'dense': dense
    }"
  >
    <div class="table-container">
      <TableContent
        :header="header"
        :data="dataToDisplay"
        :checkbox-enabled="checkboxEnabled"
        :checkbox-label="checkboxLabel"
        :empty-table-text="emptyTableText"
        :draggable-sort="draggableSort"
        :loading="loading"
        :striped="striped"
        :hover="hover"
        :dense="dense"
        @on-items-select="onItemSelect"
        @on-sort-items="onSortItems"
      >
        <template
          v-for="(_, name) in $slots"
          #[name]="slotProps"
        >
          <slot
            :name="name"
            v-bind="(slotProps as { row: T })"
          />
        </template>
      </TableContent>
    </div>
    <TableFooter
      v-if="paginate && totalItems > 0"
      v-model:items-per-page="itemsInTable"
      :current-page="currentPage"
      :page-count="pageCount"
      :count="totalItems"
      :items-per-page-dropdown-enabled="itemsPerPageDropdownEnabled"
      @page-change="pageChange"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import TableContent from './components/table/TableContent.vue'
import TableFooter from './components/table/footer/TableFooter.vue'

interface TableColumn {
  title: string
  label: string
  columnWidth?: number
  sortEnabled?: boolean
  class?: string | string[] | ((col: TableColumn, row?: any) => string | string[])
  textAlign?: 'left' | 'center' | 'right'
  [key: string]: unknown
}


interface Props {
  header: Array<TableColumn>
  data?: ReadonlyArray<T>
  itemsPerPage?: number
  itemsPerPageDropdownEnabled?: boolean
  checkboxEnabled?: boolean
  checkboxLabel?: string
  total?: number
  loading?: boolean
  paginate?: boolean
  emptyTableText?: string
  currentPage?: number
  pageCount?: number
  draggableSort?: boolean
  striped?: boolean
  hover?: boolean
  bordered?: boolean
  dense?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 20,
  itemsPerPageDropdownEnabled: false,
  checkboxEnabled: false,
  checkboxLabel: 'id',
  total: undefined,
  loading: false,
  paginate: true,
  emptyTableText: 'No data found',
  currentPage: 1,
  pageCount: 0,
  draggableSort: false,
  striped: true,
  hover: true,
  bordered: true,
  dense: false,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'on-page-change', page: number): void
  (e: 'on-items-select', selectedItems: unknown): void
  (e: 'on-items-per-page-change', itemsPerPage: number): void
  (e: 'sort-items', items: T[]): void
}>()

defineSlots<{
  [name: string]: (props: { row: T }) => any
}>()

const currentPage = ref<number>(props.currentPage)
const itemsInTable = ref<number>((props.itemsPerPage && props.itemsPerPage > 0) ? props.itemsPerPage : 20)

// Guard flag to avoid emitting when syncing from parent props
const syncingItemsPerPageFromProps = ref<boolean>(false)

watch(
  () => itemsInTable.value,
  (val: number) => {
    currentPage.value = 1
    
    // Avoid feedback loop if this change originated from props sync
    if (syncingItemsPerPageFromProps.value) {
      syncingItemsPerPageFromProps.value = false

      return
    }
    emit('on-items-per-page-change', val)
  },
)

// Keep internal itemsInTable in sync with prop changes (e.g., after first fetch)
watch(
  () => props.itemsPerPage,
  (val: number | undefined) => {
    if (typeof val === 'number' && val > 0 && val !== itemsInTable.value) {
      syncingItemsPerPageFromProps.value = true
      itemsInTable.value = val
    }
  },
)

// Keep internal currentPage in sync with prop changes (e.g., server-driven pagination)
watch(
  () => props.currentPage,
  (val: number | undefined) => {
    if (typeof val === 'number' && val > 0) currentPage.value = val
  },
)

const pageChange = (page: number) => {
  currentPage.value = page
  
  // Emit both event names for compatibility
  emit('page-change', page)
  emit('on-page-change', page)
}

const dataToDisplay = computed(() => (props.data ?? []) as Record<string, unknown>[])

const totalItems = computed(() => {
  if (typeof props.total === 'number') return props.total

  if (props.data) return props.data.length

  return 0
})

const pageCount = computed(() => {
  // Prefer explicit pageCount prop (server-side pagination) only when provided (> 0)
  if (typeof props.pageCount === 'number' && props.pageCount > 0) return props.pageCount
  const perPage = Math.max(1, itemsInTable.value || props.itemsPerPage || 1)
  
  return Math.max(1, Math.ceil((totalItems.value || 0) / perPage))
})

const onItemSelect = (selectedItems: unknown) => emit('on-items-select', selectedItems)
const onSortItems = (items: unknown[]) => emit('sort-items', items as T[])
</script>

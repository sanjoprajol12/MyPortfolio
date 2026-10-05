<template>
  <div class="position-relative">
    <table :class="[loading && 'table-loading']">
      <TableHeadRow
        :checkbox-enabled-value="check"
        :checkbox-enabled="checkboxEnabled"
        :header="header"
        @on-select="selectAll"
      />
      <TableBodyRow
        v-if="data.length !== 0 && !loading"
        :currently-selected-items="selectedItems"
        :data="data"
        :header="header"
        :checkbox-enabled="checkboxEnabled"
        :draggable-sort="draggableSort"
        :checkbox-label="checkboxLabel"
        @on-select="itemsSelect"
        @on-change-sort="onChangeSort"
      >
        <template
          v-for="(_, name) in $slots"
          #[name]="{ row }"
        >
          <slot
            :name="name"
            :row="row"
          />
        </template>
      </TableBodyRow>
      <tbody v-else-if="loading">
        <tr
          v-for="i in 5"
          :key="i"
        >
          <td v-if="checkboxEnabled">
            <VSkeletonLoader
              type="avatar"
              width="20"
              height="20"
            />
          </td>
          <td
            v-for="(col, index) in header"
            :key="index"
          >
            <VSkeletonLoader type="text" />
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td
            :colspan="header.length + (checkboxEnabled ? 1 : 0)"
            class="empty-state"
          >
            <EmptyState
              icon="inbox"
              :title="emptyTableText"
              compact
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface ContentTableColumn {
  title: string
  label: string
  columnWidth?: number
  sortEnabled?: boolean
  [key: string]: unknown
}

interface ContentTableRow {
  [key: string]: unknown
}

interface Props {
  header: Array<ContentTableColumn>
  data: Array<ContentTableRow>
  emptyTableText?: string
  checkboxEnabled?: boolean
  checkboxLabel?: string
  loading?: boolean
  draggableSort?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emptyTableText: "No data found",
  checkboxEnabled: false,
  checkboxLabel: "id",
  loading: false,
  draggableSort: false,
})

const emit = defineEmits<{
  (e: 'on-items-select', selectedItems: Array<unknown>): void
  <T>(e: 'on-sort-items', items: T[]): void
}>()

const selectedItems = ref<Array<unknown>>([])
const allSelectedItems = ref<Array<unknown>>([])
const check = ref<boolean>(false)

watch(
  () => props.data,
  () => {
    selectedItems.value = []
    allSelectedItems.value = []
    check.value = false
    props.data.forEach((item: unknown) => {
      if (item && typeof item === 'object' && props.checkboxLabel in item) {
        allSelectedItems.value.push((item as Record<string, unknown>)[props.checkboxLabel])
      }
    })
  },
)

const selectAll = (checked: boolean) => {
  check.value = checked
  if (checked) {
    selectedItems.value = [
      ...new Set([...selectedItems.value, ...allSelectedItems.value]),
    ]
  } else {
    selectedItems.value = []
  }
}

const itemsSelect = (value: Array<unknown>) => {
  selectedItems.value = []
  value.forEach((item: unknown) => {
    if (!selectedItems.value.includes(item)) selectedItems.value.push(item)
  })
}

watch(
  () => [...selectedItems.value],
  (currentValue: unknown[]) => {
    if (currentValue) {
      emit("on-items-select", currentValue)
    }
  },
)

onMounted(() => {
  selectedItems.value = []
  allSelectedItems.value = []
  check.value = false
  props.data.forEach((item: unknown) => {
    if (item && typeof item === 'object' && props.checkboxLabel in item) {
      allSelectedItems.value.push((item as Record<string, unknown>)[props.checkboxLabel])
    }
  })
})

const onChangeSort = <T>(items: T[]) => {
  emit<T>('on-sort-items', items)
}
</script>

<template>
  <div class="table-footer">
    <div class="footer-content">
      <div
        class="results-summary"
        aria-live="polite"
      >
        <span>
          Showing
          <strong>{{ firstItem }}</strong>
          –
          <strong>{{ lastItem }}</strong>
          of
          <strong>{{ count }}</strong>
        </span>
      </div>
      <TableItemsPerPageSelect
        v-if="itemsPerPageDropdownEnabled"
        :items-per-page="itemsPerPage"
        :items-per-page-dropdown-enabled="itemsPerPageDropdownEnabled"
        @update:items-per-page="onItemsPerPageChange"
      />
      <div class="pagination-wrapper">
        <TablePagination
          :current-page="page"
          :total-pages="pageCount"
          :total="count"
          :per-page="itemsPerPage"
          @page-change="pageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  pageCount: number
  itemsPerPage?: number
  itemsPerPageDropdownEnabled?: boolean
  currentPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 5,
  pageCount: 1,
  itemsPerPage: 5,
  itemsPerPageDropdownEnabled: false,
  currentPage: 1,
})

const emit = defineEmits<{
  'update:items-per-page': [value: number]
  'page-change': [page: number]
}>()

const page = ref(props.currentPage)
const inputItemsPerPage = ref(props.itemsPerPage)


watch(
  () => props.currentPage,
  (val: number) => {
    page.value = val
  },
)

onMounted(() => {
  inputItemsPerPage.value = props.itemsPerPage
})

const pageChange = (newPage: number) => {
  page.value = newPage
  emit("page-change", page.value)
}

const onItemsPerPageChange = (value: number) => {
  inputItemsPerPage.value = value
  emit('update:items-per-page', value)
}

const firstItem = computed<number>(() => {
  const total = props.count ?? 0
  if (!total) return 0
  const per = props.itemsPerPage ?? 0
  const p = page.value || 1

  return (p - 1) * per + 1
})

const lastItem = computed<number>(() => {
  const total = props.count ?? 0
  if (!total) return 0
  const per = props.itemsPerPage ?? 0
  const p = page.value || 1

  return Math.min(p * per, total)
})
</script>

<style scoped>
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: space-between;
}
.results-summary {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.pagination-wrapper {
  margin-left: auto;
}
</style>

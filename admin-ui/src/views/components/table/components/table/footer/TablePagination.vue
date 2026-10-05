<template>
  <div class="d-flex align-items-end justify-content-end justify-content-md-end">
    <VPagination
      :model-value="currentPage"
      :length="totalPages"
      :total-visible="maxVisibleButtons"
      @update:model-value="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  maxVisibleButtons?: number
  totalPages: number
  total: number
  perPage: number
  currentPage: number
  itemsPerPageDropdownEnabled?: boolean
}

withDefaults(defineProps<Props>(), {
  maxVisibleButtons: 7,
  itemsPerPageDropdownEnabled: false,
})

const emit = defineEmits<{ (e: 'page-change', page: number): void }>()

const onPageChange = (page: number) => {
  emit('page-change', page)
}
</script>

<style lang="scss" scoped>
/* Vuetify pagination handles all styling */
</style>

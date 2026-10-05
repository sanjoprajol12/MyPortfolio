<template>
  <div class="items-per-page-container">
    <VSelect
      v-model="selectedValue"
      :items="itemsPerPageOptions"
      density="compact"
      variant="outlined"
      hide-details
      class="items-per-page-select"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  itemsPerPage?: number
  itemsPerPageDropdownEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  itemsPerPageDropdownEnabled: false,
})

const emit = defineEmits<{
  'update:items-per-page': [value: number]
}>()

const inputItemsPerPage = ref(10)

onMounted(() => {
  inputItemsPerPage.value = props.itemsPerPage
})

const itemsPerPageOptions = [5, 10, 25, 50, 100]

const selectedValue: WritableComputedRef<number> = computed({
  get(): number {
    return props.itemsPerPage
  },
  set(value: number): void {
    emit('update:items-per-page', value)
  },
})
</script>

<template>
  <thead>
    <tr>
      <th v-if="checkboxEnabled">
        <VCheckbox
          v-model="checked"
          density="compact"
          hide-details
          color="primary"
          @change="selectAll"
        />
      </th>
      <template
        v-for="(column, i) in header"
        :key="i"
      >
        <th
          :class="[
            typeof column.class === 'function' ? column.class(column) : column.class,
            `text-${column.textAlign || 'left'}`
          ]"
          :style="{
            minWidth: column.columnWidth ? `${column.columnWidth}px` : 'auto',
            width: 'auto',
          }"
        >
          <span class="fw-semibold">{{ column.title }}</span>
        </th>
      </template>
    </tr>
  </thead>
</template>

<script setup lang="ts">
interface TableColumn {
  title: string
  label: string
  columnWidth?: number
  class?: string | string[] | ((col: TableColumn) => string | string[])
  textAlign?: 'left' | 'center' | 'right'
}

interface Props {
  checkboxEnabledValue?: boolean
  checkboxEnabled?: boolean
  header: Array<TableColumn>
}

const props = withDefaults(defineProps<Props>(), {
  checkboxEnabledValue: false,
  checkboxEnabled: false,
})

const emit = defineEmits<{
  'on-select': [checked: boolean]
}>()

const checked = ref<boolean>(false)


watch(
  () => props.checkboxEnabledValue,
  (currentValue: boolean) => {
    checked.value = currentValue
  },
)

const selectAll = () => {
  emit("on-select", checked.value)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

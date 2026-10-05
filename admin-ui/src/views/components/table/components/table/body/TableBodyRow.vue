<!-- eslint-disable vue/component-name-in-template-casing -->
<template>
  <tbody v-if="!draggableSort">
    <template
      v-for="(row, i) in data"
      :key="i"
    >
      <tr>
        <td v-if="checkboxEnabled">
          <VCheckbox
            v-model="selectedItems"
            type="checkbox"
            :value="(row as TableRow)[checkboxLabel]"
            @change="onChange"
          />
        </td>
        <template
          v-for="(properties, j) in header"
          :key="j"
        >
          <td
            :class="[
              typeof properties.class === 'function' ? properties.class(properties, row) : properties.class,
              `text-${(properties as TableColumn).textAlign || 'left'}`
            ]"
          >
            <template v-if="$slots[(properties as TableColumn).label]">
              <slot
                :name="`${(properties as TableColumn).label}`"
                :row="row"
              />
            </template>
            <template v-else>
              {{ (row as Record<string, unknown>)[(properties as TableColumn).label] }}
            </template>
          </td>
        </template>
      </tr>
    </template>
  </tbody>
  <draggable
    v-else
    :list="data"
    tag="tbody"
    :item-key="checkboxLabel || 'id'"
    @change="onChangeSort"
    @start="dragging = true"
    @end="dragging = false"
  >
    <!-- @vue-ignore vue3-draggable-next ships no slot types -->
    <template #item="{ element }: { element: TableRow }">
      <tr
        class="draggable-row"
        :class="{ dragging: dragging }"
      >
        <td
          v-if="checkboxEnabled"
          class="text-left"
        >
          <VCheckbox
            v-model="selectedItems"
            :value="element[checkboxLabel]"
            density="compact"
            hide-details
            @change="onChange"
          />
        </td>
        <template
          v-for="(properties, j) in header"
          :key="j"
        >
          <td
            :class="[
              typeof properties.class === 'function' ? properties.class(properties, element) : properties.class,
              `text-${(properties as TableColumn).textAlign || 'left'}`
            ]"
          >
            <template v-if="$slots[(properties as TableColumn).label]">
              <slot
                :name="`${(properties as TableColumn).label}`"
                :row="element"
              />
            </template>
            <template v-else>
              {{ (element as Record<string, unknown>)[(properties as TableColumn).label] }}
            </template>
          </td>
        </template>
      </tr>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from "vue3-draggable-next"

interface TableColumn {
  label: string
  class?: string | string[] | ((col: TableColumn, row?: TableRow) => string | string[])
  textAlign?: 'left' | 'center' | 'right'
  [key: string]: unknown
}

interface TableRow {
  [key: string]: unknown
}

interface Props {
  header: Array<TableColumn>
  data: Array<TableRow>
  currentlySelectedItems?: Array<unknown>
  checkboxEnabled?: boolean
  draggableSort?: boolean
  checkboxLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentlySelectedItems: () => [],
  checkboxEnabled: false,
  draggableSort: false,
  checkboxLabel: "id",
})

const emit = defineEmits<{
  'on-select': [selectedItems: Array<unknown>]
  'on-change-sort': [data: Array<unknown>]
}>()

const selectedItems = ref<Array<unknown>>([])
const dragging = ref(false)

watch(
  () => [...props.currentlySelectedItems],
  (currentValue: unknown[]) => {
    if (props.currentlySelectedItems.length !== 0) {
      selectedItems.value = [
        ...new Set([...selectedItems.value, ...currentValue]),
      ]
    } else {
      selectedItems.value = []
    }
  },
)

const onChange = () => {
  emit("on-select", selectedItems.value)
}

const onChangeSort = () => {
  emit("on-change-sort", props.data)
}
</script>

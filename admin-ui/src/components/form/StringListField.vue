<!-- An ordered list of text entries (paragraphs, bullet points, features). -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  hint?: string
  addLabel?: string
  emptyText?: string
  multiline?: boolean
}>(), {
  label: '',
  hint: '',
  addLabel: 'Add item',
  emptyText: 'Nothing added yet.',
  multiline: false,
})

const items = defineModel<string[]>({ required: true })

const rows = computed({
  get: () => items.value.map(value => ({ value })),
  set: (next: { value: string }[]) => {
    items.value = next.map(row => row.value)
  },
})

const updateValue = (index: number, value: string) => {
  items.value = items.value.map((item, i) => (i === index ? value : item))
}
</script>

<template>
  <div>
    <div
      v-if="props.label"
      class="text-body-2 text-high-emphasis mb-1"
    >
      {{ props.label }}
    </div>
    <div
      v-if="props.hint"
      class="text-caption text-medium-emphasis mb-3"
    >
      {{ props.hint }}
    </div>

    <ListEditor
      v-model="rows"
      :new-item="() => ({ value: '' })"
      :add-label="props.addLabel"
      :empty-text="props.emptyText"
    >
      <template #default="{ index }">
        <VTextarea
          v-if="props.multiline"
          :model-value="items[index]"
          rows="2"
          auto-grow
          density="compact"
          @update:model-value="(val: string) => updateValue(index, val)"
        />
        <VTextField
          v-else
          :model-value="items[index]"
          density="compact"
          @update:model-value="(val: string) => updateValue(index, val)"
        />
      </template>
    </ListEditor>
  </div>
</template>

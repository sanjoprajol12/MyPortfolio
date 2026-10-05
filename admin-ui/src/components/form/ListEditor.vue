<!--
  Repeatable rows of fields (stats, sidebar rows, education, ...).
  The default slot renders one row's fields; items are edited in place.
-->
<script setup lang="ts" generic="T extends object">
const props = withDefaults(defineProps<{
  newItem: () => T
  addLabel?: string
  emptyText?: string
}>(), {
  addLabel: 'Add row',
  emptyText: 'Nothing added yet.',
})

const items = defineModel<T[]>({ required: true })

defineSlots<{
  default: (props: { item: T, index: number }) => any
}>()

const addItem = () => {
  items.value = [...items.value, props.newItem()]
}

const removeItem = (index: number) => {
  items.value = items.value.filter((_, i) => i !== index)
}

const moveItem = (index: number, offset: -1 | 1) => {
  const target = index + offset
  if (target < 0 || target >= items.value.length) return

  const next = [...items.value]
  const [moved] = next.splice(index, 1)

  next.splice(target, 0, moved!)
  items.value = next
}
</script>

<template>
  <div class="list-editor">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="list-editor__row"
    >
      <div class="list-editor__fields">
        <slot
          :item="item"
          :index="index"
        />
      </div>

      <div class="list-editor__actions">
        <IconBtn
          size="small"
          :disabled="index === 0"
          aria-label="Move up"
          @click="moveItem(index, -1)"
        >
          <VIcon
            icon="arrow-up"
            size="18"
          />
        </IconBtn>
        <IconBtn
          size="small"
          :disabled="index === items.length - 1"
          aria-label="Move down"
          @click="moveItem(index, 1)"
        >
          <VIcon
            icon="arrow-down"
            size="18"
          />
        </IconBtn>
        <IconBtn
          size="small"
          color="error"
          aria-label="Remove"
          @click="removeItem(index)"
        >
          <VIcon
            icon="trash-2"
            size="18"
          />
        </IconBtn>
      </div>
    </div>

    <div
      v-if="!items.length"
      class="text-body-2 text-disabled mb-3"
    >
      {{ props.emptyText }}
    </div>

    <VBtn
      variant="tonal"
      size="small"
      prepend-icon="plus"
      @click="addItem"
    >
      {{ props.addLabel }}
    </VBtn>
  </div>
</template>

<style lang="scss" scoped>
.list-editor__row {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  gap: 0.5rem;
  margin-block-end: 0.75rem;
}

.list-editor__fields {
  flex: 1 1 auto;
  min-inline-size: 0;
}

.list-editor__actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.125rem;
}

@media (max-width: 599px) {
  .list-editor__row {
    flex-direction: column;
    align-items: stretch;
  }

  .list-editor__actions {
    justify-content: flex-end;
  }
}
</style>

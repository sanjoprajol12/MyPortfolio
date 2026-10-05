<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  width: {
    type: Number,
    default: 450,
  },
  location: {
    type: String as () => 'start' | 'end',
    default: 'end',
  },
  temporary: {
    type: Boolean,
    default: true,
  },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <VNavigationDrawer
      :temporary="temporary"
      :width="width"
      :location="location"
      class="scrollable-content base-drawer"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <div class="base-drawer__wrapper">
        <!-- Header -->
        <div class="base-drawer__header">
          <slot name="header" />
        </div>
        <VDivider />
        <!-- Content -->
        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          class="base-drawer__content"
        >
          <slot />
        </PerfectScrollbar>
        <!-- Actions -->
        <VDivider />
        <VCardActions class="base-drawer__actions">
          <slot name="actions" />
        </VCardActions>
      </div>
    </VNavigationDrawer>
  </Teleport>
</template>

 <style scoped>
.base-drawer__wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.base-drawer__header,
.base-drawer__actions {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}
.base-drawer__content {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>(), {
  subtitle: '',
  icon: '',
})

defineEmits<{
  (e: 'cancel', el: MouseEvent): void
}>()
</script>

<template>
  <div class="drawer-header d-flex align-center gap-3">
    <VAvatar
      v-if="props.icon"
      color="primary"
      variant="tonal"
      rounded="lg"
      size="40"
      class="flex-shrink-0"
    >
      <VIcon
        :icon="props.icon"
        size="22"
      />
    </VAvatar>

    <div class="flex-grow-1 min-w-0">
      <h5 class="text-h5 text-truncate">
        {{ props.title }}
      </h5>
      <div
        v-if="props.subtitle"
        class="text-body-2 text-medium-emphasis text-truncate"
      >
        {{ props.subtitle }}
      </div>
    </div>

    <slot name="beforeClose" />

    <IconBtn
      class="text-medium-emphasis"
      size="small"
      aria-label="Close"
      @click="$emit('cancel', $event)"
    >
      <VIcon
        icon="x"
        size="22"
      />
    </IconBtn>
  </div>
</template>

<style scoped>
.drawer-header {
  padding: 1rem 1.25rem;
}

.min-w-0 {
  min-inline-size: 0;
}
</style>

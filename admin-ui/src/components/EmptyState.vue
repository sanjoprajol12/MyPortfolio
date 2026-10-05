<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  title?: string
  text?: string
  compact?: boolean
}>(), {
  icon: 'inbox',
  title: 'Nothing here yet',
  text: '',
  compact: false,
})
</script>

<template>
  <div
    class="empty-state-block"
    :class="{ 'empty-state-block--compact': props.compact }"
  >
    <VAvatar
      color="secondary"
      variant="tonal"
      :size="props.compact ? 48 : 64"
      class="mb-3"
    >
      <VIcon
        :icon="props.icon"
        :size="props.compact ? 24 : 30"
      />
    </VAvatar>
    <div class="text-body-1 font-weight-medium text-high-emphasis">
      {{ props.title }}
    </div>
    <div
      v-if="props.text"
      class="text-body-2 text-medium-emphasis mt-1"
    >
      {{ props.text }}
    </div>
    <div
      v-if="$slots.default"
      class="mt-4"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state-block--compact {
  padding: 2rem 1rem;
}
</style>

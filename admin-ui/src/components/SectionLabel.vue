<!-- Divider-style heading that groups related fields inside a form. -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  icon?: string
  subtitle?: string
}>(), {
  icon: '',
  subtitle: '',
})
</script>

<template>
  <div class="section-label">
    <div class="d-flex align-center gap-2">
      <VIcon
        v-if="props.icon"
        :icon="props.icon"
        size="18"
        color="primary"
      />
      <span class="section-label__title">{{ props.title }}</span>
      <VDivider class="ms-2" />
    </div>
    <div
      v-if="props.subtitle"
      class="text-caption text-medium-emphasis mt-1"
    >
      {{ props.subtitle }}
    </div>
  </div>
</template>

<style scoped>
.section-label__title {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>

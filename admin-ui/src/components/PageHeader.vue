<!-- Title row used at the top of every admin card: icon tile, title, subtitle and actions. -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon?: string
  color?: string
  size?: 'default' | 'small'
}>(), {
  subtitle: '',
  icon: '',
  color: 'primary',
  size: 'default',
})
</script>

<template>
  <div
    class="page-header"
    :class="`page-header--${props.size}`"
  >
    <div class="d-flex align-center gap-4 flex-grow-1 min-w-0">
      <VAvatar
        v-if="props.icon"
        :color="props.color"
        variant="tonal"
        rounded="lg"
        :size="props.size === 'small' ? 38 : 46"
        class="flex-shrink-0"
      >
        <VIcon
          :icon="props.icon"
          :size="props.size === 'small' ? 20 : 24"
        />
      </VAvatar>

      <div class="min-w-0">
        <div class="d-flex align-center flex-wrap gap-2">
          <h2 class="page-header__title">
            {{ props.title }}
          </h2>
          <slot name="badge" />
        </div>
        <p
          v-if="props.subtitle || $slots.subtitle"
          class="page-header__subtitle"
        >
          <slot name="subtitle">
            {{ props.subtitle }}
          </slot>
        </p>
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="page-header__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;

  &--small {
    padding: 1rem 1.25rem;

    .page-header__title {
      font-size: 1rem;
    }
  }

  &__title {
    margin: 0;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.5rem;
  }

  &__subtitle {
    margin: 0.125rem 0 0;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
}

.min-w-0 {
  min-inline-size: 0;
}
</style>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string | number
  desc?: string
  icon: string
  iconColor: string
  to?: string
}>()

const router = useRouter()
</script>

<template>
  <VCard
    flat
    class="admin-card stat-card h-100"
    :class="{ 'stat-card--link': !!props.to }"
    @click="props.to && router.push({ name: props.to })"
  >
    <VCardText class="d-flex flex-column h-100">
      <div class="d-flex align-center justify-space-between mb-4">
        <VAvatar
          :color="props.iconColor"
          variant="tonal"
          rounded="lg"
          size="44"
        >
          <VIcon
            :icon="props.icon"
            size="24"
          />
        </VAvatar>
        <VIcon
          v-if="props.to"
          icon="arrow-up-right"
          size="20"
          class="stat-card__arrow text-disabled"
        />
      </div>

      <h3 class="text-h3 stat-card__value mb-1">
        {{ props.value }}
      </h3>
      <div class="text-body-1 text-high-emphasis font-weight-medium">
        {{ props.title }}
      </div>
      <div
        v-if="props.desc"
        class="text-body-2 text-medium-emphasis mt-1"
      >
        {{ props.desc }}
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;

  &__value {
    font-weight: 600;
  }

  &--link {
    cursor: pointer;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.4) !important;
      transform: translateY(-2px);

      .stat-card__arrow {
        color: rgb(var(--v-theme-primary)) !important;
      }
    }
  }
}
</style>

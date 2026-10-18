<script setup lang="ts">
import { passwordProblem, passwordScore } from '@/utils/password'

const props = defineProps<{
  password: string
  username?: string
}>()

const LEVELS = [
  { label: '', color: 'secondary' },
  { label: 'Too weak', color: 'error' },
  { label: 'Fair', color: 'warning' },
  { label: 'Good', color: 'info' },
  { label: 'Strong', color: 'success' },
]

const score = computed(() => passwordScore(props.password, props.username))
const problem = computed(() => (props.password ? passwordProblem(props.password, props.username) : null))
const level = computed(() => LEVELS[score.value] ?? LEVELS[0]!)
</script>

<template>
  <div
    v-if="props.password"
    class="password-strength"
  >
    <VProgressLinear
      :model-value="score * 25"
      :color="level.color"
      height="4"
      rounded
      aria-hidden="true"
    />
    <div
      class="text-caption mt-1"
      aria-live="polite"
    >
      <span :class="`text-${level.color}`">Strength: {{ level.label }}.</span>
      <span
        v-if="problem"
        class="text-medium-emphasis"
      > {{ problem }}</span>
    </div>
  </div>
</template>

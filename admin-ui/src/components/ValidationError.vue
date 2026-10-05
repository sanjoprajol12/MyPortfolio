<!-- components/ValidationError.vue -->
<script setup lang="ts">
export type ValidationErrors = Record<string, string[]>

const props = defineProps<{
  errors?: ValidationErrors | any
  field: string
}>()
</script>

<template>
  <span
    v-if="props.errors && props.errors?.[props.field]?.[0]"
    class="text-danger d-block mt-1"
  >
    ** {{ props.errors[props.field][0] }}
  </span>
</template>

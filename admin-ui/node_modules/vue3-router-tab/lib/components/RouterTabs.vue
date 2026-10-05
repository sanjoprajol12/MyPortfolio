<template>
  <span class="router-tabs" aria-hidden="true" />
</template>

<script setup lang="ts">
import { useRouterTabsPersistence } from '../persistence'
import type { RouterTabsPersistenceOptions } from '../core/types'

defineOptions({ name: 'RouterTabs' })

const props = defineProps<RouterTabsPersistenceOptions>()

useRouterTabsPersistence(props)
</script>

<script setup lang="ts">
import type { ThemeStyle } from '@/types/layouts'

const themes: ThemeStyle[] = [

  {
    name: 'light',
    icon: 'sun',
  },
  {
    name: 'dark',
    icon: 'moon',
  },
]
</script>

<template>
  <ThemeStyle :themes="themes" />
</template>

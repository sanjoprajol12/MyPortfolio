<script setup lang="ts">
import { useTheme } from "vuetify"
import { initAppConfigStore } from "@/store/config"
import initCore from "./core/initConfig"

const { global } = useTheme()

const primaryColor = computed(() => hexToRgbColor(global.current.value.colors.primary))

initCore()
initAppConfigStore()
</script>

<template>
  <VApp :style="`--v-global-theme-primary: ${primaryColor}`">
    <RouterView />
    <ScrollToTop />
    <Vue3ConfirmDialogBox />
    <Vue3notify />
  </VApp>
</template>

<script setup lang="ts">
import { useAppConfigStore } from '@/store/config'
import type { ThemeStyle } from '@/types/layouts'

const props = defineProps<{
  themes: ThemeStyle[]
}>()

const configStore = useAppConfigStore()

const selectedItem = ref([configStore.theme])

// Update icon if theme is changed from other sources
watch(
  () => configStore.theme,
  () => {
    selectedItem.value = [configStore.theme]
  },
  { deep: true },
)
</script>

<template>
  <IconBtn>
    <VIcon :icon="props.themes.find((t: ThemeStyle) => t.name === configStore.theme)?.icon" />

    <VTooltip
      activator="parent"
      open-delay="1000"
      scroll-strategy="close"
    >
      <span class="text-capitalize">{{ configStore.theme }}</span>
    </VTooltip>
    <VMenu
      activator="parent"
      offset="15px"
      width="160"
    >
      <VList
        v-model:selected="selectedItem"
        mandatory
      >
        <VListItem
          v-for="{ name, icon } in props.themes"
          :key="name"
          :value="name"
          :prepend-icon="icon"
          color="primary"
          class="text-capitalize"
          @click="() => { configStore.theme = name as 'light' | 'dark' | 'system' }"
        >
          {{ name }}
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>

<script lang="ts" setup>
import { appConfig } from '@themeConfig'
import type { NavSectionTitle } from '@/types/layouts'
import { useAppConfigStore } from '@/store/config'

defineProps<{
  item: NavSectionTitle
}>()

const configStore = useAppConfigStore()
const shallRenderIcon = configStore.isVerticalNavMini()
</script>

<template>
  <li class="nav-section-title">
    <div class="title-wrapper">
      <Transition
        name="vertical-nav-section-title"
        mode="out-in"
      >
        <Component
          :is="shallRenderIcon ? appConfig.app.iconRenderer : 'span'"
          :key="shallRenderIcon"
          :class="shallRenderIcon ? 'placeholder-icon' : 'title-text'"
          v-bind="{ ...appConfig.icons.sectionTitlePlaceholder}"
        >
          {{ !shallRenderIcon ? item.heading : null }}
        </Component>
      </Transition>
    </div>
  </li>
</template>

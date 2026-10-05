<script lang="ts" setup>
import { appConfig } from '@themeConfig'
import { useAppConfigStore } from '@/store/config'
import type { NavLink } from '@/types/layouts'
import { getComputedNavLinkToProp, isNavLinkActive, getDynamicI18nProps } from '@/utils/utils'
import { useRouter } from 'vue-router'

const props = defineProps<{
  item: NavLink
}>()

const configStore = useAppConfigStore()

const hideTitleAndBadge = configStore.isVerticalNavMini()
const $router = useRouter()

// Prevent navigation if already on the target route
const handleClick = (event: Event) => {
  if (isNavLinkActive(props.item, $router)) {
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>

<template>
  <li
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, $router) }"
      active-class=""
      exact-active-class=""
      @click="handleClick"
    >
      <Component
        :is="appConfig.app.iconRenderer || 'div'"
        v-bind="(item.icon as Record<string, any>) || (appConfig.navbar.defaultNavItemIconProps as Record<string, any>)"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <span
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </span>

        <span
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </span>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>

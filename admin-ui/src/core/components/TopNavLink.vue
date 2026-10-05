<script lang="ts" setup>
import { appConfig } from '@themeConfig'
import type { NavLink } from '@/types/layouts'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@/utils/utils'

interface Props {
  item: NavLink
  isSubItem?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubItem: false,
})

const $router = useRouter()
</script>

<template>
  <li
    class="nav-link"
    :class="[
      {
        'sub-item': props.isSubItem,
        'disabled': item.disable,
      },
    ]"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{
        'router-link-active router-link-exact-active': isNavLinkActive(
          item,
          $router,
        ),
      }"
    >
      <Component
        :is="appConfig.app.iconRenderer || 'div'"
        class="nav-item-icon"
        v-bind="(item.icon as Record<string, any>) || (appConfig.navbar.defaultNavItemIconProps as Record<string, any>)"
      />
      <span
        class="nav-item-title"
        v-bind="getDynamicI18nProps(item.title, 'span')"
      >
        {{ item.title }}
      </span>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>

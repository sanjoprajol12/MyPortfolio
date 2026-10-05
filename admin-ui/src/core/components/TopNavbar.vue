<script lang="ts" setup>
import type { TopNavItems, NavGroup, NavLink } from '@/types/layouts'
import TopNavGroup from './TopNavGroup.vue'
import TopNavLink from './TopNavLink.vue'

defineProps<{
  navItems: TopNavItems
}>()

const resolveNavItemComponent = (item: NavLink | NavGroup) => {
  if ('children' in item)
    return TopNavGroup

  return TopNavLink
}

defineOptions({ name: 'Navbar' })
</script>

<template>
  <div class="layout-horizontal-nav">
    <div class="horizontal-nav-content-container">
      <div class="horizontal-nav-content-container">
        <ul class="nav-items d-flex align-items-center">
          <Component
            :is="resolveNavItemComponent(item)"
            v-for="(item, index) in navItems"
            :key="index"
            :item="item"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout-wrapper.layout-nav-type-horizontal {
  .nav-items {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>

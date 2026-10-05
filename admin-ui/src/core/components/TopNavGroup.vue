<script lang="ts" setup>
import { appConfig } from '@themeConfig'
import type { NavGroup } from '@/types/layouts'
import TopNavLink from './TopNavLink.vue'

interface Props {
  item: NavGroup
  childrenAtEnd?: boolean
  isSubItem?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  childrenAtEnd: false,
  isSubItem: false,
})

const route = useRoute()

const router = useRouter()

const isGroupActive = ref(false)

watch(
  () => route.path,
  () => {
    const isActive = isNavGroupActive(props.item.children, router)

    isGroupActive.value = isActive
  },
  { immediate: true },
)
</script>

<template>
  <TopNavPopper
    class="nav-group"
    tag="li"
    content-container-tag="ul"
    :class="[
      {
        'active': isGroupActive,
        'children-at-end': childrenAtEnd,
        'sub-item': isSubItem,
        'disabled': item.disable,
      },
    ]"
    :popper-inline-end="childrenAtEnd"
  >
    <div class="nav-group-label">
      <Component
        :is="appConfig.app.iconRenderer || 'div'"
        class="nav-item-icon"
        v-bind="(item.icon || appConfig.navbar.defaultNavItemIconProps) as any"
      />
      <span class="nav-item-title">
        {{ item.title }}
      </span>
      <Component
        :is="appConfig.app.iconRenderer || 'div'"
        class="nav-group-arrow"
        v-bind="appConfig.icons.chevronDown"
      />
    </div>

    <template #content>
      <Component
        :is="'children' in child ? 'TopNavGroup' : TopNavLink"
        v-for="child in item.children"
        :key="child.title"
        :item="child"
        children-at-end
        is-sub-item
      />
    </template>
  </TopNavPopper>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-group {
    .nav-group-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .popper-content {
      z-index: 1;

      > div {
        overflow: hidden auto;
      }
    }
  }
}
</style>

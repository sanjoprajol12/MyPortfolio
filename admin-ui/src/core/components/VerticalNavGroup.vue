<script lang="ts" setup>
import { TransitionGroup } from 'vue'
import { getDynamicI18nProps } from '@/utils/utils'
import { appConfig } from '@themeConfig'
import { TransitionExpand, VerticalNavLink } from '@/types/components'
import type { NavGroup } from '@/types/layouts'
import { useAppConfigStore } from '@/store/config'

const props = defineProps<{
  item: NavGroup
}>()

defineOptions({
  name: 'VerticalNavGroup',
})

const route = useRoute()
const router = useRouter()

const configStore = useAppConfigStore()

const hideTitleAndBadge = configStore.isVerticalNavMini()

const isVerticalNavHovered = inject(injectionKeyIsVerticalNavHovered, ref(false))

const isGroupActive = ref(false)
const isGroupOpen = ref(false)

const isAnyChildOpen = (children: NavGroup['children']): boolean => {
  return children.some((child: NavGroup['children'][number]) => {
    let result = openGroups.value.includes(child.title)

    if ('children' in child)
      result = isAnyChildOpen(child.children) || result

    return result
  })
}

const collapseChildren = (children: NavGroup['children']) => {
  children.forEach((child: NavGroup['children'][number]) => {
    if ('children' in child)
      collapseChildren(child.children)

    openGroups.value = openGroups.value.filter((groupTitle: string) => groupTitle !== child.title)
  })
}

watch(
  () => route.path,
  () => {
    const isActive = isNavGroupActive(props.item.children, router)

    isGroupOpen.value = isActive && !configStore.isVerticalNavMini(isVerticalNavHovered).value
    isGroupActive.value = isActive
  },
  { immediate: true },
)

watch(isGroupOpen, (val: boolean) => {
  const grpIndex = openGroups.value.indexOf(props.item.title)
  if (val && grpIndex === -1) {
    openGroups.value.push(props.item.title)
  }

  else if (!val && grpIndex !== -1) {
    openGroups.value.splice(grpIndex, 1)
    collapseChildren(props.item.children)
  }
}, { immediate: true })

watch(openGroups, (val: string[]) => {
  const lastOpenedGroup = val.at(-1)
  if (lastOpenedGroup === props.item.title)
    return

  const isActive = isNavGroupActive(props.item.children, router)

  if (isActive)
    return

  if (isAnyChildOpen(props.item.children))
    return

  isGroupOpen.value = isActive
  isGroupActive.value = isActive
}, { deep: true })

watch(
  configStore.isVerticalNavMini(isVerticalNavHovered),
  (val: boolean) => {
    isGroupOpen.value = val ? false : isGroupActive.value
  },
)
</script>

<template>
  <li
    class="nav-group"
    :class="[
      {
        active: isGroupActive,
        open: isGroupOpen,
        disabled: item.disable,
      },
    ]"
  >
    <div
      class="nav-group-label"
      @click="isGroupOpen = !isGroupOpen"
    >
      <Component
        :is="appConfig.app.iconRenderer || 'div'"
        v-bind="(item.icon || appConfig.navbar.defaultNavItemIconProps) as any"
        class="nav-item-icon"
      />

      <Component
        :is="TransitionGroup"
        name="transition-slide-x"
      >
        <!--  Title -->
        <span
          v-show="!hideTitleAndBadge"
          v-bind="getDynamicI18nProps(item.title, 'span')"
          key="title"
          class="nav-item-title"
        >
          {{ item.title }}
        </span>

        <!--  Badge -->
        <span
          v-show="!hideTitleAndBadge"
          v-if="item.badgeContent"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
        >
          {{ item.badgeContent }}
        </span>
        <Component
          :is="appConfig.app.iconRenderer || 'div'"
          v-show="!hideTitleAndBadge"
          v-bind="appConfig.icons.chevronRight"
          key="arrow"
          class="nav-group-arrow"
        />
      </Component>
    </div>
    <TransitionExpand>
      <ul
        v-show="isGroupOpen"
        class="nav-group-children"
      >
        <Component
          :is="'children' in child ? 'VerticalNavGroup' : VerticalNavLink"
          v-for="child in item.children"
          :key="child.title"
          :item="child"
        />
      </ul>
    </TransitionExpand>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-group {
    &-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}
</style>

<script lang="ts" setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VNodeRenderer } from './VNodeRenderer'
import { appConfig } from '@themeConfig'
import { VerticalNavGroup, VerticalNavLink, VerticalNavSectionTitle } from '@/types/components'
import type { NavGroup, NavLink, NavSectionTitle, VerticalNavItems } from '@/types/layouts'
import { useAppConfigStore } from '@/store/config'

interface Props {
  tag?: string | Component
  navItems: VerticalNavItems
  isOverlayNavActive: boolean
  toggleIsOverlayNavActive: (value: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'aside',
})

const route = useRoute()

const refNav = ref()

const isHovered = useElementHover(refNav)

provide(injectionKeyIsVerticalNavHovered, isHovered)

const configStore = useAppConfigStore()

const resolveNavItemComponent = (item: NavLink | NavSectionTitle | NavGroup): unknown => {
  if ('heading' in item)
    return VerticalNavSectionTitle
  if ('children' in item)
    return VerticalNavGroup

  return VerticalNavLink
}


watch(() => route.name, () => {
  props.toggleIsOverlayNavActive(false)
})

const isVerticalNavScrolled = ref(false)
const updateIsVerticalNavScrolled = (val: boolean) => isVerticalNavScrolled.value = val

const handleNavScroll = (evt: Event) => {
  isVerticalNavScrolled.value = (evt.target as HTMLElement).scrollTop > 0
}

const hideTitleAndIcon = configStore.isVerticalNavMini(isHovered)
</script>

<template>
  <Component
    :is="props.tag"
    ref="refNav"
    class="layout-vertical-nav"
    :class="[
      {
        'overlay-nav': configStore.isLessThanOverlayNavBreakpoint,
        'hovered': isHovered,
        'visible': isOverlayNavActive,
        'scrolled': isVerticalNavScrolled,
      },
    ]"
  >
    <!--  Header -->
    <div class="nav-header">
      <slot name="nav-header">
        <RouterLink
          to="/"
          class="app-logo app-title-wrapper"
        >
          <VNodeRenderer :nodes="appConfig.app.logo" />

          <Transition name="vertical-nav-app-title">
            <h1
              v-show="!hideTitleAndIcon"
              class="app-logo-title leading-normal"
            >
              {{ appConfig.app.title }}
            </h1>
          </Transition>
        </RouterLink>
        <!--  Vertical nav actions -->
        <!-- Show toggle collapsible in >md and close button in <md -->
        <div class="header-action">
          <Component
            :is="appConfig.app.iconRenderer || 'div'"
            v-show="configStore.isVerticalNavCollapsed"
            class="d-none nav-unpin"
            :class="configStore.isVerticalNavCollapsed && 'd-lg-block'"
            v-bind="appConfig.icons.verticalNavUnPinned"
            @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          />
          <Component
            :is="appConfig.app.iconRenderer || 'div'"
            v-show="!configStore.isVerticalNavCollapsed"
            class="d-none nav-pin"
            :class="!configStore.isVerticalNavCollapsed && 'd-lg-block'"
            v-bind="appConfig.icons.verticalNavPinned"
            @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          />
          <Component
            :is="appConfig.app.iconRenderer || 'div'"
            class="d-lg-none"
            v-bind="appConfig.icons.close"
            @click="toggleIsOverlayNavActive(false)"
          />
        </div>
      </slot>
    </div>
    <slot name="before-nav-items">
      <div class="vertical-nav-items-shadow" />
    </slot>
    <slot
      name="nav-items"
      :update-is-vertical-nav-scrolled="updateIsVerticalNavScrolled"
    >
      <PerfectScrollbar
        :key="String(configStore.isAppRTL)"
        tag="ul"
        class="nav-items"
        :options="{ wheelPropagation: false }"
        @ps-scroll-y="handleNavScroll"
      >
        <Component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in navItems"
          :key="index"
          :item="item"
        />
      </PerfectScrollbar>
    </slot>

    <slot name="after-nav-items" />
  </Component>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    text-transform: uppercase;
  }
}
</style>

<style lang="scss">
@use "@theme-variables" as variables;
@use "@styles/layouts/mixins";

//  Vertical Nav
.layout-vertical-nav {
  position: fixed;
  z-index: variables.$layout-vertical-nav-z-index;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: variables.$layout-vertical-nav-width;
  inset-block-start: 0;
  inset-inline-start: 0;
  transition: inline-size 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  will-change: transform, inline-size;

  .nav-header {
    display: flex;
    align-items: center;

    .header-action {
      cursor: pointer;

      @at-root {
        #{variables.$selector-vertical-nav-mini} .nav-header .header-action {
          &.nav-pin,
          &.nav-unpin {
            display: none !important;
          }
        }
      }
    }
  }

  .app-title-wrapper {
    margin-inline-end: auto;
  }

  .nav-items {
    block-size: 100%;

    // We no loner needs this overflow styles as perfect scrollbar applies it
    // overflow-x: hidden;

    // // We used `overflow-y` instead of `overflow` to mitigate overflow x. Revert back if any issue found.
    // overflow-y: auto;
  }

  .nav-item-title {
    overflow: hidden;
    margin-inline-end: auto;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  //  Collapsed
  .layout-vertical-nav-collapsed & {
    &:not(.hovered) {
      inline-size: variables.$layout-vertical-nav-collapsed-width;
    }
  }
}

// Small screen vertical nav transition
@media (max-width: 1279px) {
  .layout-vertical-nav {
    &:not(.visible) {
      transform: translateX(-#{variables.$layout-vertical-nav-width});

      @include mixins.rtl {
        transform: translateX(variables.$layout-vertical-nav-width);
      }
    }

    transition: transform 0.25s ease-in-out;
  }
}
</style>

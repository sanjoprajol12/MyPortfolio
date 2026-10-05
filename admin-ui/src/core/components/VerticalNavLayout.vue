<script lang="ts" setup>
import { VerticalNav } from '@/types/components'
import { useAppConfigStore } from '@/store/config'
import type { VerticalNavItems } from '@/types/layouts'

interface Props {
  navItems: VerticalNavItems
  verticalNavAttrs?: {
    wrapper?: string
    wrapperProps?: Record<string, unknown>
  }
}

const props = withDefaults(defineProps<Props>(), {
  verticalNavAttrs: () => ({}),
})

const { width: windowWidth } = useWindowSize()

const configStore = useAppConfigStore()

const isOverlayNavActive = ref(false)

const isLayoutOverlayVisible = ref(false)

const toggleIsOverlayNavActive = useToggle(isOverlayNavActive)

syncRef(isOverlayNavActive, isLayoutOverlayVisible)

watch(windowWidth, () => {
  if (!configStore.isLessThanOverlayNavBreakpoint && isLayoutOverlayVisible.value)
    isLayoutOverlayVisible.value = false
})

const verticalNavAttrs = computed(() => {
  const vNavAttrs = toRef(props, 'verticalNavAttrs')

  const { wrapper: verticalNavWrapper, wrapperProps: verticalNavWrapperProps, ...additionalVerticalNavAttrs } = vNavAttrs.value

  return {
    verticalNavWrapper,
    verticalNavWrapperProps,
    additionalVerticalNavAttrs,
  }
})
</script>

<template>
  <div
    class="layout-wrapper"
    :class="configStore._layoutClasses"
  >
    <component
      :is="verticalNavAttrs.verticalNavWrapper ? verticalNavAttrs.verticalNavWrapper : 'div'"
      v-bind="verticalNavAttrs.verticalNavWrapperProps"
      class="vertical-nav-wrapper"
    >
      <VerticalNav
        :is-overlay-nav-active="isOverlayNavActive"
        :toggle-is-overlay-nav-active="toggleIsOverlayNavActive"
        :nav-items="props.navItems"
        v-bind="{ ...verticalNavAttrs.additionalVerticalNavAttrs }"
      >
        <template #nav-header>
          <slot name="vertical-nav-header" />
        </template>
        <template #before-nav-items>
          <slot name="before-vertical-nav-items" />
        </template>
      </VerticalNav>
    </component>
    <div class="layout-content-wrapper">
      <header
        class="layout-navbar"
        :class="[{ 'navbar-blur': configStore.isNavbarBlurEnabled }]"
      >
        <div class="navbar-content-container">
          <slot
            name="navbar"
            :toggle-vertical-overlay-nav-active="toggleIsOverlayNavActive"
          />
        </div>
      </header>
      <main class="layout-page-content">
        <div class="page-content-container">
          <!--
            Tab persistence is off: restoring a saved snapshot redirects away from the
            URL being opened, which breaks reloads, bookmarks and deep links. 
          -->
          <RouterTab
            context-menu
            :cookie-key="null"
          />
        </div>
      </main>
      <footer class="layout-footer">
        <div class="footer-content-container">
          <slot name="footer" />
        </div>
      </footer>
    </div>
    <div
      class="layout-overlay"
      :class="[{ visible: isLayoutOverlayVisible }]"
      @click="() => { isLayoutOverlayVisible = !isLayoutOverlayVisible }"
    />
  </div>
</template>

<style lang="scss">
@use "@theme-variables" as variables;
@use "@styles/layouts/placeholders";
@use "@styles/layouts/mixins";

.layout-wrapper.layout-nav-type-vertical {
   block-size: 100%;

  .layout-content-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-block-size: 100dvh;
    transition: padding-inline-start 0.2s ease-in-out;
    will-change: padding-inline-start;

    @media screen and (min-width: 1280px) {
      padding-inline-start: variables.$layout-vertical-nav-width;
    }
  }

  .layout-navbar {
    z-index: variables.$layout-vertical-nav-layout-navbar-z-index;

    .navbar-content-container {
      block-size: variables.$layout-vertical-nav-navbar-height;
    }

    @at-root {
      .layout-wrapper.layout-nav-type-vertical {
        .layout-navbar {
          @if variables.$layout-vertical-nav-navbar-is-contained {
            @include mixins.boxed-content;
          }

          // else
          @else {
            .navbar-content-container {
              @include mixins.boxed-content;
            }
          }
        }
      }
    }
  }

  &.layout-navbar-sticky .layout-navbar {
    @extend %layout-navbar-sticky;
  }

  &.layout-navbar-hidden .layout-navbar {
    @extend %layout-navbar-hidden;
  }

  //  Footer
  .layout-footer {
    @include mixins.boxed-content;
  }

  //  Layout overlay
  .layout-overlay {
    position: fixed;
    z-index: variables.$layout-overlay-z-index;
    background-color: rgb(0 0 0 / 60%);
    cursor: pointer;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease-in-out;
    will-change: opacity;

    &.visible {
      opacity: 1;
      pointer-events: auto;
    }
  }

  // Adjust right column pl when vertical nav is collapsed
  &.layout-vertical-nav-collapsed .layout-content-wrapper {
    @media screen and (min-width: 1280px) {
      padding-inline-start: variables.$layout-vertical-nav-collapsed-width;
    }
  }

  //  Content height fixed
  &.layout-content-height-fixed {
    .layout-content-wrapper {
      max-block-size: 100dvh;
    }

    .layout-page-content {
      display: flex;
      overflow: hidden;

      .page-content-container {
        inline-size: 100%;

        > :first-child {
          max-block-size: 100%;
          overflow-y: auto;
        }
      }
    }
  }
}
</style>

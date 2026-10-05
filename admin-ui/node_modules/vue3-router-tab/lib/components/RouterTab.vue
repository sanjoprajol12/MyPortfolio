<template>
  <div class="router-tab">
    <header class="router-tab__header" :class="{ 'is-not-sticky': !stickyHeader }">
      <div
        class="router-tab__slot-start"
        :class="{ 'has-content': hasStartSlot }"
      >
        <slot name="start" />
      </div>

      <div class="router-tab__scroll" ref="scrollContainer">
        <transition-group
          tag="ul"
          class="router-tab__nav"
          role="tablist"
          v-bind="tabTransitionProps"
        >
          <li
            v-for="(tab, index) in tabs"
            :key="tab.id"
            role="tab"
            :class="buildTabClass(tab)"
            :data-title="getTabTitle(tab)"
            :aria-selected="controller.activeId.value === tab.id"
            :aria-current="controller.activeId.value === tab.id ? 'page' : undefined"
            :tabindex="controller.activeId.value === tab.id ? 0 : -1"
            :draggable="sortable"
            :ref="(el) => setTabRef(tab.id, el as HTMLElement)"
            @click="activate(tab)"
            @keydown="onTabKeydown(tab, index, $event)"
            @auxclick.middle.prevent="close(tab)"
            @contextmenu.prevent="showContextMenu(tab, $event)"
            @dragstart="onDragStart(tab, index, $event)"
            @dragover="onDragOver(index, $event)"
            @dragenter="onDragEnter(index)"
            @dragleave="onDragLeave"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
          >
            <i v-if="tab.icon" :class="['router-tab__item-icon', tab.icon]" />
            <span class="router-tab__item-title" :title="getReactiveTabTitle(tab)">
              {{ getReactiveTabTitle(tab) }}
            </span>
            <button
              v-if="isClosable(tab)"
              type="button"
              class="router-tab__item-close"
              :aria-label="`Close ${getReactiveTabTitle(tab)}`"
              @click.stop="close(tab)"
              @keydown.stop
            />
          </li>
        </transition-group>
      </div>

      <div
        class="router-tab__slot-end"
        :class="{ 'has-content': hasEndSlot }"
      >
        <slot name="end" />
      </div>
    </header>

    <div class="router-tab__container">
      <RouterView v-if="!persistenceHydrating" v-slot="{ Component, route }">
        <template v-if="hasCustomSlot">
          <slot
            v-bind="{
              Component,
              route,
              controller,
              pageRef: (el: any) => handleComponentRef(el, controller.getRouteKey(route))
            }"
          />
        </template>
        <template v-else>
          <template v-if="controller.options.keepAlive">
            <KeepAlive :include="includeKeys">
              <component
                v-if="Component"
                :is="getNamedComponent(Component, getComponentCacheKey(route))"
                :key="getComponentCacheKey(route)"
                :ref="(el: any) => handleComponentRef(el, controller.getRouteKey(route))"
                class="router-tab-page"
              />
            </KeepAlive>
          </template>
          <template v-else>
            <transition v-bind="pageTransitionProps" appear>
              <component
                v-if="Component"
                :is="Component"
                :key="controller.getRouteKey(route)"
                :ref="(el: any) => handleComponentRef(el, controller.getRouteKey(route))"
                class="router-tab-page"
              />
            </transition>
          </template>
        </template>
      </RouterView>
      <div v-else class="router-tab__hydrating" aria-hidden="true" />
    </div>

    <!-- Use v-show instead of v-if to keep DOM and prevent re-creation overhead -->
    <div
      v-show="context.visible && context.target"
      ref="menuRef"
      class="router-tab__contextmenu"
      role="menu"
      @keydown="onMenuKeydown"
      :style="{ left: context.position.x + 'px', top: context.position.y + 'px' }"
    >
      <button
        v-for="(item, index) in menuItems"
        :key="item.id"
        type="button"
        role="menuitem"
        :class="['router-tab__contextmenu-item', { 'is-focused': index === highlightedIndex }]"
        :aria-disabled="item.disabled"
        :disabled="item.disabled"
        :tabindex="item.disabled ? -1 : index === highlightedIndex ? 0 : -1"
        :ref="el => setMenuItemRef(el, index)"
        @mouseenter="!item.disabled && highlightMenuIndex(index)"
        @click="handleMenuAction(item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onErrorCaptured,
  provide,
  ref,
  watch
} from 'vue'
import { RouterView } from 'vue-router'
import type { PropType } from 'vue'
import { createRouterTabs } from '../core/createRouterTabs'
import type {
  RouterTabsMenuConfig,
  RouterTabsOptions,
  RouterTabsPersistenceOptions,
  TabInput,
  TabRecord,
  TransitionLike
} from '../core/types'
import { getTransOpt } from '../util/index'
import { routerTabsKey, routerTabsCookie } from '../constants'
import { useRouterTabsPersistence } from '../persistence'
import { useKeepAliveComponentCache } from '../useKeepAliveComponentCache'
import { useReactiveTabWatcher } from '../useReactiveTabWatcher'
import { useTabNavigation } from '../useTabNavigation'
import { useTabContextMenu } from '../useTabContextMenu'
import { useTabDragSort } from '../useTabDragSort'

const RouterTab = defineComponent({
  name: 'RouterTab',
  components: { RouterView },
  props: {
    tabs: {
      type: Array as PropType<TabInput[]>,
      default: () => []
    },
    keepAlive: {
      type: Boolean,
      default: true
    },
    maxAlive: {
      type: Number,
      default: 0
    },
    keepLastTab: {
      type: Boolean,
      default: true
    },
    stickyHeader: {
      type: Boolean,
      default: true
    },
    append: {
      type: String as PropType<'last' | 'next'>,
      default: 'last'
    },
    defaultPage: {
      type: [String, Object] as PropType<RouterTabsOptions['defaultRoute']>,
      default: '/'
    },
    tabTransition: {
      type: [String, Object] as PropType<TransitionLike>,
      default: 'router-tab-zoom'
    },
    pageTransition: {
      type: [String, Object] as PropType<TransitionLike>,
      default: () => ({ name: 'router-tab-swap', mode: 'out-in' })
    },
    contextMenu: {
      type: [Boolean, Array] as PropType<boolean | RouterTabsMenuConfig[]>,
      default: true
    },
    cookieKey: {
      type: String,
      default: routerTabsCookie
    },
    persistence: {
      type: Object as PropType<RouterTabsPersistenceOptions | null>,
      default: null
    },
    sortable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['tab-sort', 'tab-sorted'],
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    if (!instance) {
      throw new Error('[RouterTab] component must be used within a Vue application context.')
    }

    const router = instance.appContext.app.config.globalProperties.$router
    if (!router) {
      throw new Error('[RouterTab] Vue Router is required. Make sure to call app.use(router) before RouterTab.')
    }

    const controller = createRouterTabs(router, {
      initialTabs: props.tabs,
      keepAlive: props.keepAlive,
      maxAlive: props.maxAlive,
      keepLastTab: props.keepLastTab,
      appendPosition: props.append,
      defaultRoute: props.defaultPage,
    })

    provide(routerTabsKey, controller)
    instance.appContext.config.globalProperties.$tabs = controller

    const hasCustomSlot = computed(() => Boolean(instance?.slots?.default))
    const hasStartSlot = computed(() => Boolean(instance?.slots?.start))
    const hasEndSlot = computed(() => Boolean(instance?.slots?.end))

    const {
      handleComponentRef,
      cleanupStaleWatchers,
      cleanupAllWatchers,
      getReactiveTabTitle
    } = useReactiveTabWatcher(controller)

    // Error handling: Capture errors from child components
    onErrorCaptured((err, instance, info) => {
      console.error('[RouterTab] Error captured from component:', err, info)
      
      // Just log the error, don't try to manipulate the cache
      // as it can cause infinite loops with KeepAlive
      
      // Return false to propagate the error to parent
      return false
    })

    let persistenceHydrating = ref(false)
    if (props.cookieKey !== null || props.persistence) {
      const options: RouterTabsPersistenceOptions = {
        ...(props.persistence ?? {})
      }
      if (props.cookieKey !== null) {
        options.cookieKey = options.cookieKey ?? (props.cookieKey || routerTabsCookie)
      } else if (!options.cookieKey) {
        options.cookieKey = routerTabsCookie
      }
      const persistenceState = useRouterTabsPersistence(options)
      persistenceHydrating = persistenceState.hydrating
    }

    const tabTransitionProps = computed(() => getTransOpt(props.tabTransition))
    const pageTransitionProps = computed(() => getTransOpt(props.pageTransition))

    const {
      dragState,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragEnd
    } = useTabDragSort(controller.tabs, () => props.sortable, emit)

    function getTabIndex(id: string) {
      return controller.tabs.findIndex(item => item.id === id)
    }

    const {
      context,
      menuRef,
      highlightedIndex,
      menuItems,
      handleMenuAction,
      showContextMenu,
      hideContextMenu,
      setMenuItemRef,
      onMenuKeydown,
      highlightMenuIndex
    } = useTabContextMenu(controller, () => props.contextMenu, isClosable)

    function getTabTitle(tab: TabRecord): string {
      if (typeof tab.title === 'string' && tab.title.trim()) return tab.title
      if (Array.isArray(tab.title) && tab.title.length && String(tab.title[0]).trim()) return String(tab.title[0])
      return 'Untitled'
    }
    
    const {
      getNamedComponent,
      getComponentCacheKey,
      pruneComponentCache,
      clearComponentCache
    } = useKeepAliveComponentCache(controller)

    function isClosable(tab: TabRecord) {
      if (tab.closable === false) return false
      if (controller.options.keepLastTab && controller.tabs.length <= 1) return false
      return true
    }

    async function close(tab: TabRecord) {
      await controller.closeTab(tab.id)
    }

    const {
      scrollContainer,
      setTabRef,
      scrollTabIntoView,
      activate,
      onTabKeydown
    } = useTabNavigation(controller, close, isClosable)

    function buildTabClass(tab: TabRecord) {
      return [
        'router-tab__item',
        {
          'is-active': controller.activeId.value === tab.id,
          'is-closable': isClosable(tab),
          'is-dragging': dragState.dragging && dragState.dragTab?.id === tab.id,
          'is-drag-over': dragState.dropIndex === getTabIndex(tab.id)
        },
        tab.tabClass
      ]
    }

    onBeforeUnmount(() => {
      const globals = instance.appContext.config.globalProperties
      if (globals.$tabs === controller) {
        globals.$tabs = null
      }
      
      cleanupAllWatchers()
      clearComponentCache()
    })

    watch(
      () => props.keepAlive,
      value => {
        controller.options.keepAlive = value
      }
    )

    // Clean up stale component instances when tabs are closed
    watch(
      () => controller.tabs.length,
      () => {
        cleanupStaleWatchers()
        pruneComponentCache()
      }
    )

    watch(
      () => controller.tabs.map(tab => `${tab.id}::${tab.renderKey ?? 0}`),
      () => {
        pruneComponentCache()
      }
    )

    const includeKeys = controller.includeKeys

    return {
      controller,
      tabs: controller.tabs,
      includeKeys,
      persistenceHydrating,
      tabTransitionProps,
      pageTransitionProps,
      buildTabClass,
      activate,
      close,
      onTabKeydown,
      context,
      menuItems,
      handleMenuAction,
      showContextMenu,
      hideContextMenu,
      getTabTitle,
      isClosable,
      hasCustomSlot,
      hasStartSlot,
      hasEndSlot,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragEnd,
      handleComponentRef,
      getReactiveTabTitle,
      getComponentCacheKey,
      getNamedComponent,
      menuRef,
      highlightedIndex,
      setMenuItemRef,
      onMenuKeydown,
      highlightMenuIndex,
      scrollContainer,
      setTabRef,
      scrollTabIntoView
    }
  }
})

export default RouterTab
</script>

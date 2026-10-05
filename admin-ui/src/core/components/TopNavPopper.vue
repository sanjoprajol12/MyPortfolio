<script lang="ts" setup>
import { useAppConfigStore } from '@/store/config'
import type { ReferenceElement } from '@floating-ui/dom'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { appConfig } from '@themeConfig'

interface Props {
  popperInlineEnd?: boolean
  tag?: string
  contentContainerTag?: string
  isRtl?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  popperInlineEnd: false,
  tag: 'div',
  contentContainerTag: 'div',
  isRTL: false,
})

const configStore = useAppConfigStore()
const refPopperContainer = ref<ReferenceElement>()
const refPopper = ref<HTMLElement>()

const popperContentStyles = ref({
  left: '0px',
  top: '0px',
})

const updatePopper = async () => {
  if (refPopperContainer.value !== undefined && refPopper.value !== undefined) {
    const { x, y } = await computePosition(
      refPopperContainer.value,
      refPopper.value,
      {
        placement: props.popperInlineEnd
          ? props.isRtl
            ? 'left-start'
            : 'right-start'
          : 'bottom-start',
        middleware: [
          ...(configStore.topNavbarPopoverOffset
            ? [offset(configStore.topNavbarPopoverOffset)]
            : []),
          flip({ boundary: document.querySelector('body')! }),

          shift({ boundary: document.querySelector('body')! }),
        ],

      },
    )

    popperContentStyles.value.left = `${x}px`
    popperContentStyles.value.top = `${y}px`
  }
}

// until(() => configStore.horizontalNavType)
//   .toMatch(type => type === 'static')
//   .then(() => {
//     useEventListener('scroll', updatePopper)
//   })

const isContentShown = ref(false)

const showContent = () => {
  isContentShown.value = true
  updatePopper()
}

const hideContent = () => {
  isContentShown.value = false
}

onMounted(updatePopper)

watch(
  [() => configStore.isAppRTL, () => configStore.appContentWidth],
  updatePopper,
)

const route = useRoute()

watch(() => route.fullPath, hideContent)
</script>

<template>
  <div
    class="nav-popper"
    :class="[
      {
        'popper-inline-end': popperInlineEnd,
        'show-content': isContentShown,
      },
    ]"
  >
    <div
      ref="refPopperContainer"
      class="popper-triggerer"
      @mouseenter="showContent"
      @mouseleave="hideContent"
    >
      <slot />
    </div>

    <template v-if="!appConfig.topNavbar.transition">
      <div
        ref="refPopper"
        class="popper-content"
        :style="popperContentStyles"
        @mouseenter="showContent"
        @mouseleave="hideContent"
      >
        <div>
          <slot name="content" />
        </div>
      </div>
    </template>

    <template v-else-if="typeof appConfig.topNavbar.transition === 'string'">
      <Transition :name="appConfig.topNavbar.transition">
        <div
          v-show="isContentShown"
          ref="refPopper"
          class="popper-content"
          :style="popperContentStyles"
          @mouseenter="showContent"
          @mouseleave="hideContent"
        >
          <div>
            <slot name="content" />
          </div>
        </div>
      </Transition>
    </template>

    <template v-else>
      <Component :is="appConfig.topNavbar.transition">
        <div
          v-show="isContentShown"
          ref="refPopper"
          class="popper-content"
          :style="popperContentStyles"
          @mouseenter="showContent"
          @mouseleave="hideContent"
        >
          <div>
            <slot name="content" />
          </div>
        </div>
      </Component>
    </template>
  </div>
</template>

<style lang="scss">
.popper-content {
  position: absolute;
}
</style>

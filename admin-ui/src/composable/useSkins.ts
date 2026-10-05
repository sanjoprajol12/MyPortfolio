import { VThemeProvider } from 'vuetify/components/VThemeProvider'
import { useAppConfigStore } from '@/store/config'

export const useSkins = () => {
  const configStore = useAppConfigStore()

  const layoutAttrs = computed(() => ({
    verticalNavAttrs: {
      wrapper: h(VThemeProvider, { tag: 'div' }),
      wrapperProps: {
        withBackground: true,
        theme: (configStore.isVerticalNavSemiDark)
          ? 'dark'
          : undefined,
      },
    },
  }))

  const injectSkinClasses = () => {
    if (typeof document !== 'undefined') {
      const bodyClasses = document.body.classList
      const genSkinClass = (_skin?: string) => `skin--${_skin}`

      watch(
        () => configStore.skin,
        (val: string, oldVal?: string) => {
          bodyClasses.remove(genSkinClass(oldVal))
          bodyClasses.add(genSkinClass(val))
        },
        { immediate: true },
      )
    }
  }

  return {
    injectSkinClasses,
    layoutAttrs,
  }
}

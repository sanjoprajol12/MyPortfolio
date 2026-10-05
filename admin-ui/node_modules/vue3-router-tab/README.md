# Vue3 Router Tab

[![npm version](https://badge.fury.io/js/vue3-router-tab.svg)](https://badge.fury.io/js/vue3-router-tab)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

A powerful, feature-rich Vue 3 tab-bar plugin that keeps multiple routes alive with smooth transitions, context menus, drag-and-drop reordering, and optional cookie-based persistence. Built for modern Vue 3 applications with full TypeScript support.

## ⚠️ Breaking Change

The legacy `contextmenu` prop alias has been removed.
Use `contextMenu` instead.

## ✨ Key Features

- 🎯 **Multi-tab Navigation** - Keep multiple routes alive simultaneously with intelligent caching
- 🔄 **7 Built-in Transitions** - Smooth page transitions (swap, slide, fade, scale, flip, rotate, bounce)
- 🎨 **Reactive Tab Titles** - Automatically update tab titles, icons, and closability from component state
- 🖱️ **Context Menu** - Right-click tabs for refresh, close, and navigation options
- 🔀 **Drag & Drop** - Reorder tabs with drag-and-drop (sortable)
- 💾 **Cookie Persistence** - Restore tabs on page refresh with customizable options
- 🎭 **Theme Support** - Light, dark, and system themes with customizable colors
- ⚡ **KeepAlive Support** - Preserve component state when switching tabs with smart cache management
- ♿ **Accessibility** - Full WCAG compliance with ARIA labels, keyboard navigation, and screen reader support
- 🚀 **Performance Optimized** - Intelligent caching, memoization, and memory management
- 🎛️ **Highly Configurable** - Extensive props, events, and customization options
- 📱 **TypeScript Support** - Full TypeScript definitions with excellent developer experience
- 🔧 **Error Recovery** - Automatic error handling with graceful degradation and recovery mechanisms

## 📦 Installation

Requires Vue `^3.3.0` and Vue Router `^4.2.0` or `^5.0.0`.

```bash
npm install vue3-router-tab
# or
pnpm add vue3-router-tab
# or
yarn add vue3-router-tab
```

## 🚀 Quick Start

### 1. Register the Plugin

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import RouterTab from 'vue3-router-tab'

const app = createApp(App)
app.use(router)
app.use(RouterTab)
app.mount('#app')
```

### 2. Basic Usage

```vue
<template>
  <router-tab />
</template>
```

That's it! You now have a fully functional tabbed router interface.

### 3. Enhanced Usage with Persistence

```vue
<template>
  <router-tab
    cookie-key="my-app-tabs"
    :sortable="true"
    :keep-alive="true"
  />
</template>
```

## 📖 Usage Guide

### Basic Configuration

```vue
<template>
  <router-tab
    cookie-key="app-tabs"
    :keep-alive="true"
    :max-alive="10"
    :keep-last-tab="true"
    :sortable="true"
    page-transition="router-tab-fade"
    tab-transition="router-tab-zoom"
  />
</template>
```

### Route Configuration

Configure your routes with tab metadata:

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      title: 'Home',
      icon: 'mdi-home',
      keepAlive: true,
    },
  },
  {
    path: '/users',
    component: Users,
    meta: {
      title: 'Users',
      icon: 'mdi-account-group',
      closable: true,
      keepAlive: true,
    },
  },
  {
    path: '/settings',
    component: Settings,
    meta: {
      title: 'Settings',
      icon: 'mdi-cog',
      closable: false, // Can't be closed
      keepAlive: false,
    },
  },
]
```

### Reactive Tab Properties

Make your tabs dynamic by exposing reactive properties in your components:

```vue
<template>
  <div>
    <h1>{{ pageTitle }}</h1>
    <button @click="updateTitle">Update Title</button>
    <div v-if="loading">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// These reactive properties automatically update the tab
const pageTitle = ref('Dashboard')
const loading = ref(false)
const notificationCount = ref(0)

// Tab title updates automatically
const routeTabTitle = computed(() => {
  if (loading.value) return 'Loading...'
  if (notificationCount.value > 0) return `Dashboard (${notificationCount.value})`
  return pageTitle.value
})

// Tab icon changes based on state
const routeTabIcon = computed(() =>
  loading.value ? 'mdi-loading mdi-spin' : 'mdi-view-dashboard'
)

// Prevent closing while loading
const routeTabClosable = computed(() => !loading.value)

function updateTitle() {
  pageTitle.value = 'Updated Dashboard'
}
</script>
```

## 🎨 Transitions

Choose from 7 built-in transition effects:

```vue
<!-- Default transition -->
<router-tab />

<!-- Custom transition -->
<router-tab page-transition="router-tab-scale" />

<!-- Advanced configuration -->
<router-tab :page-transition="{ name: 'router-tab-flip', mode: 'out-in' }" />
```

### Available Transitions

| Transition | Description | Best For |
|------------|-------------|----------|
| `router-tab-swap` | Smooth up/down slide with fade | General purpose (default) |
| `router-tab-slide` | Horizontal sliding | Dashboard navigation |
| `router-tab-fade` | Simple opacity fade | Minimal, subtle |
| `router-tab-scale` | Zoom in/out effect | Dramatic transitions |
| `router-tab-flip` | 3D flip animation | Modern, creative |
| `router-tab-rotate` | Rotation with scale | Playful, dynamic |
| `router-tab-bounce` | Elastic bounce | Fun, energetic |

## 🎭 Theming

### Built-in Themes

```ts
import { setRouterTabsTheme } from 'vue3-router-tab'

// Switch themes at runtime
setRouterTabsTheme('dark')
setRouterTabsTheme('light')
setRouterTabsTheme('system') // Follows OS preference
```

### Custom Colors

```ts
import { setRouterTabsPrimary } from 'vue3-router-tab'

setRouterTabsPrimary({
  primary: '#3b82f6',
  background: '#ffffff',
  text: '#1f2937',
  activeBackground: '#3b82f6',
  activeText: '#ffffff',
  border: '#e5e7eb'
})
```

### CSS Customization

```css
:root {
  /* Layout */
  --router-tab-header-height: 48px;
  --router-tab-padding: 16px;

  /* Colors */
  --router-tab-primary: #3b82f6;
  --router-tab-background: #ffffff;
  --router-tab-active-background: #3b82f6;
}
```

## ♿ Accessibility

Vue3 Router Tab is fully accessible with:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Arrow keys, Enter, Delete, Home, End
- **Focus Management**: Logical tab order and focus indicators
- **Semantic HTML**: Proper roles and structure

```vue
<!-- Accessible by default -->
<router-tab />

<!-- Custom ARIA labels -->
<router-tab aria-label="Main navigation tabs" />
```

### Keyboard Shortcuts

- **Arrow Keys**: Navigate between tabs
- **Enter/Space**: Activate selected tab
- **Delete/Backspace**: Close current tab (if closable)
- **Home/End**: Jump to first/last tab

## 🔧 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabInput[]` | `[]` | Initial tabs to display |
| `keepAlive` | `boolean` | `true` | Enable KeepAlive for tab components |
| `maxAlive` | `number` | `0` | Maximum cached components (0 = unlimited) |
| `keepLastTab` | `boolean` | `true` | Prevent closing the last tab |
| `append` | `'last' \| 'next'` | `'last'` | Position for new tabs |
| `defaultPage` | `RouteLocationRaw` | `'/'` | Default route |
| `tabTransition` | `TransitionLike` | `'router-tab-zoom'` | Tab list transitions |
| `pageTransition` | `TransitionLike` | `{ name: 'router-tab-swap', mode: 'out-in' }` | Page transitions |
| `contextMenu` | `boolean \| RouterTabsMenuConfig[]` | `true` | Context menu configuration |
| `cookieKey` | `string` | `'router-tabs:snapshot'` | Persistence cookie key |
| `persistence` | `RouterTabsPersistenceOptions \| null` | `null` | Advanced persistence options |
| `sortable` | `boolean` | `true` | Enable drag-and-drop sorting |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tab-sort` | `{ tab: TabRecord, index: number }` | Tab drag started |
| `tab-sorted` | `{ tab: TabRecord, fromIndex: number, toIndex: number }` | Tab reordered |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `start` | - | Content before tab list |
| `end` | - | Content after tab list |
| `default` | `{ Component, route }` | Custom page rendering |

## 🎛️ Programmatic API

### Using the Composable

```vue
<script setup lang="ts">
import { useRouterTabs } from 'vue3-router-tab'

const tabs = useRouterTabs()

// Open a new tab
await tabs.openTab('/users')

// Close current tab
await tabs.closeTab()

// Refresh all tabs
await tabs.refreshAll()

</script>
```

### Controller Methods

```ts
interface RouterTabsContext {
  // Navigation
  openTab(to: RouteLocationRaw, replace?: boolean, refresh?: boolean | 'sameTab'): Promise<void>
  closeTab(id?: string, options?: CloseTabOptions): Promise<void>

  // Management
  refreshTab(id?: string, force?: boolean): Promise<void>
  refreshAll(force?: boolean): Promise<void>
  removeTab(id: string, opts?: RemoveTabOptions): Promise<void>

  // Cache Control
  setTabAlive(id: string, alive: boolean): void
  evictCache(id: string): void
  clearCache(): void
  getCacheKeys(): string[]

  // State
  reset(route?: RouteLocationRaw): Promise<void>
  reload(): Promise<void>

  // Utilities
  getRouteKey(route: RouteLocationNormalizedLoaded | RouteLocationRaw): string
  matchRoute(route: RouteLocationNormalizedLoaded | RouteLocationRaw): RouteMatchResult

  // Persistence
  snapshot(): RouterTabsSnapshot
  hydrate(snapshot: RouterTabsSnapshot): Promise<void>
}
```

## 🔄 Advanced Usage

### Custom Context Menu

```vue
<router-tab
  :contextMenu="[
    'refresh',
    'close',
    { id: 'duplicate', label: 'Duplicate Tab', handler: ({ target }) => openTab(target.to) },
    { id: 'closeOthers', label: 'Close All Others' },
    {
      id: 'openExternal',
      label: 'Open in New Window',
      handler: ({ target }) => window.open(target.to, '_blank')
    }
  ]"
/>
```

### Custom Rendering

```vue
<router-tab>
  <template #default="{ Component, route }">
    <Suspense>
      <ErrorBoundary>
        <component :is="Component" :key="route.fullPath" />
      </ErrorBoundary>
    </Suspense>
  </template>
</router-tab>
```

### Advanced Persistence

```vue
<router-tab
  :persistence="{
    cookieKey: 'my-app-tabs',
    expiresInDays: 30,
    path: '/',
    secure: true,
    sameSite: 'strict',
    serialize: (snapshot) => encrypt(JSON.stringify(snapshot)),
    deserialize: (data) => JSON.parse(decrypt(data))
  }"
/>
```

## 🧩 Composables

### useReactiveTab

```vue
<script setup lang="ts">
import { useReactiveTab } from 'vue3-router-tab'

const { routeTabTitle, routeTabIcon, routeTabClosable } = useReactiveTab({
  title: 'Dashboard',
  icon: 'mdi-view-dashboard',
  closable: true
})
</script>
```

### useLoadingTab

```vue
<script setup lang="ts">
import { useLoadingTab } from 'vue3-router-tab'

const isLoading = ref(false)
const { routeTabTitle, routeTabIcon, routeTabClosable } = useLoadingTab(isLoading, 'Dashboard')
</script>
```

### useNotificationTab

```vue
<script setup lang="ts">
import { useNotificationTab } from 'vue3-router-tab'

const notificationCount = ref(0)
const { routeTabTitle, routeTabIcon } = useNotificationTab(notificationCount, 'Messages')
</script>
```

## 🎯 Examples

### Complete App Example

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/users">Users</router-link>
      <router-link to="/settings">Settings</router-link>
    </nav>

    <router-tab
      cookie-key="my-app"
      :sortable="true"
      page-transition="router-tab-fade"
      @tab-sorted="onTabSorted"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouterTabs } from 'vue3-router-tab'

const tabs = useRouterTabs()

function onTabSorted({ tab, fromIndex, toIndex }) {
  // Save order to backend
  saveTabOrder(tab.id, toIndex)
}
</script>
```

### Real-time Updates

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouterTabs } from 'vue3-router-tab'

const tabs = useRouterTabs()
const messageCount = ref(0)
const isOnline = ref(true)

// Reactive tab title
const routeTabTitle = computed(() =>
  messageCount.value > 0 ? `Messages (${messageCount.value})` : 'Messages'
)

// Reactive tab icon
const routeTabIcon = computed(() =>
  isOnline.value ? 'mdi-message' : 'mdi-message-offline'
)

// Simulate real-time updates
onMounted(() => {
  // Connect to WebSocket or polling service
  connectToRealtimeUpdates((update) => {
    if (update.type === 'message') {
      messageCount.value++
    } else if (update.type === 'status') {
      isOnline.value = update.online
    }
  })
})
</script>
```

## 🔍 Troubleshooting

### Common Issues

**Tabs not updating titles**
- Ensure you're using `ref()` or `computed()` for reactive properties
- Check that properties are properly exposed in `<script setup>`

**Transitions not working**
- Don't use custom `#default` slot without transitions
- Ensure transition names match available transitions

**Persistence not working**
- Check that cookies are enabled
- Verify `cookie-key` prop is set
- Check browser console for cookie errors

**KeepAlive not preserving state**
- Ensure routes have `keepAlive: true` in meta
- Check that components have unique keys

**TypeScript errors**
```ts
import type { TabRecord, RouterTabsOptions } from 'vue3-router-tab'
```

### Performance Tips

- Use `maxAlive` to limit cached components
- Avoid deep watchers in tab components
- Use `evictCache()` to manually clear cache when needed
- Consider using `keepAlive: false` for memory-intensive components

## 🌟 Migration Guide

### From v1.x to v2.x

```ts
// Before
import RouterTab from 'vue3-router-tab'

// After (same)
import RouterTab from 'vue3-router-tab'
```

The API is backward compatible. New features are additive.

### Context Menu Prop Update

The legacy `contextmenu` prop alias has been removed.

Use:

```vue
<router-tab :contextMenu="true" />
```

Instead of:

```vue
<router-tab :contextmenu="true" />
```

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run the build: `npm run build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ by the Vue.js community. Special thanks to all contributors and users.

---

**Made with ❤️ for the Vue.js ecosystem**

`meta.key` accepts the shortcuts `fullPath`, `path`, or `name`, or you can supply your own function.

## Configuration

### RouterTab Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabInput[]` | `[]` | Initial tabs to display |
| `keepAlive` | `boolean` | `true` | Enable keep-alive for tab components |
| `maxAlive` | `number` | `0` | Maximum number of alive components (0 = unlimited) |
| `keepLastTab` | `boolean` | `true` | Prevent closing the last remaining tab |
| `append` | `'last' \| 'next'` | `'last'` | Where to append new tabs |
| `defaultPage` | `string \| object` | `'/'` | Default route to navigate to |
| `tabTransition` | `string \| object` | `'router-tab-zoom'` | Transition for tab changes |
| `pageTransition` | `string \| object` | `{ name: 'router-tab-swap', mode: 'out-in' }` | Transition for page changes |
| `contextMenu` | `boolean \| array` | `true` | Enable context menu or provide custom menu items |
| `cookieKey` | `string` | `'router-tabs:snapshot'` | Cookie key for persistence |
| `persistence` | `object \| null` | `null` | Persistence configuration |
| `sortable` | `boolean` | `true` | Enable drag-and-drop tab sorting |

## Page Transitions

Vue3 Router Tab includes 7 built-in page transition effects that are displayed when switching between tabs or refreshing pages.

### Available Transitions

| Transition | Description | Use Case |
|------------|-------------|----------|
| `router-tab-swap` | Slides up/down with fade (default) | General purpose, smooth |
| `router-tab-slide` | Horizontal sliding animation | Dashboard-style navigation |
| `router-tab-fade` | Simple opacity fade | Subtle, minimal distraction |
| `router-tab-scale` | Zoom in/out effect | Dramatic, attention-grabbing |
| `router-tab-flip` | 3D flip animation | Creative, modern feel |
| `router-tab-rotate` | Rotation with scale | Playful, dynamic |
| `router-tab-bounce` | Elastic bounce effect | Fun, energetic |

### Using Transitions

#### Default Transition

```vue
<router-tab />
<!-- Uses router-tab-swap by default -->
```

#### Custom Transition

```vue
<router-tab 
  :page-transition="{ name: 'router-tab-scale', mode: 'out-in' }"
/>
```

#### String Shorthand

```vue
<router-tab page-transition="router-tab-fade" />
```

#### Dynamic Transitions

Change transitions at runtime:

```vue
<template>
  <div>
    <select v-model="currentTransition">
      <option value="router-tab-swap">Swap</option>
      <option value="router-tab-slide">Slide</option>
      <option value="router-tab-fade">Fade</option>
      <option value="router-tab-scale">Scale</option>
      <option value="router-tab-flip">Flip</option>
      <option value="router-tab-rotate">Rotate</option>
      <option value="router-tab-bounce">Bounce</option>
    </select>
    
    <router-tab 
      :page-transition="{ name: currentTransition, mode: 'out-in' }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentTransition = ref('router-tab-swap')
</script>
```

### Custom Transitions

Create your own transitions by defining CSS classes:

```css
/* Your custom transition */
.my-custom-enter-active,
.my-custom-leave-active {
  transition: all 0.5s ease;
}

.my-custom-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.my-custom-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
```

```vue
<router-tab page-transition="my-custom" />
```

### Transition Tips

- **Performance**: Use `mode: 'out-in'` for smooth transitions without layout shifts
- **Duration**: Built-in transitions are optimized at 0.5-0.8 seconds
- **Accessibility**: Consider users with motion sensitivity - provide options to disable
- **Context**: Match transition style to your app's design language

## Changing Tab Titles Dynamically

Vue3 Router Tab automatically watches for reactive properties in your page components and updates the corresponding tab information in real-time.

### Quick Start

Simply expose reactive properties from your component:

```vue
<template>
  <div>
    <h1>{{ routeTabTitle }}</h1>
    <button @click="updateTitle">Change Tab Title</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// This ref is automatically watched - tab title updates when it changes!
const routeTabTitle = ref('My Page')

function updateTitle() {
  routeTabTitle.value = 'Updated Title'
}
</script>
```

### Watched Properties

The following reactive properties are automatically monitored:

| Property | Description | Example |
|----------|-------------|---------|
| `routeTabTitle` | Tab title text | `ref('Dashboard')` |
| `routeTabIcon` | Tab icon class | `ref('mdi-home')` |
| `routeTabClosable` | Can tab be closed | `ref(true)` |
| `routeTabMeta` | Additional metadata | `ref({ badge: 5 })` |

### Dynamic Titles with Computed

Create titles that update based on your component state:

```vue
<script setup>
import { ref, computed } from 'vue'

const isLoading = ref(false)
const notifications = ref(0)

// Tab title automatically updates when dependencies change
const routeTabTitle = computed(() => {
  if (isLoading.value) return 'Loading...'
  if (notifications.value > 0) return `Messages (${notifications.value})`
  return 'Dashboard'
})

// Tab icon changes based on state
const routeTabIcon = computed(() => 
  isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-view-dashboard'
)

// Prevent closing during operations
const routeTabClosable = computed(() => !isLoading.value)
</script>
```

### Real-World Examples

#### Example 1: User Profile with Name

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const user = ref(null)
const isLoading = ref(true)

const routeTabTitle = computed(() => 
  isLoading.value ? 'Loading...' : `Profile - ${user.value?.name || 'Unknown'}`
)

const routeTabIcon = computed(() => 
  isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-account'
)

onMounted(async () => {
  user.value = await fetchUser()
  isLoading.value = false
})
</script>
```

#### Example 2: Form with Unsaved Changes

```vue
<script setup>
import { ref, computed } from 'vue'

const formData = ref({})
const hasUnsavedChanges = ref(false)

const routeTabTitle = computed(() => 
  hasUnsavedChanges.value ? '• Edit Form' : 'Edit Form'
)

const routeTabClosable = computed(() => !hasUnsavedChanges.value)

function onChange() {
  hasUnsavedChanges.value = true
}
</script>
```

#### Example 3: Real-time Notifications

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const unreadCount = ref(0)

const routeTabTitle = computed(() => {
  if (unreadCount.value === 0) return 'Messages'
  return `Messages (${unreadCount.value})`
})

const routeTabIcon = computed(() => 
  unreadCount.value > 0 ? 'mdi-bell-badge' : 'mdi-bell-outline'
)

// Simulate real-time updates
onMounted(() => {
  setInterval(() => {
    unreadCount.value = Math.floor(Math.random() * 10)
  }, 5000)
})
</script>
```

### Using the Composable API

For advanced use cases, use the `useReactiveTab` composable:

```vue
<script setup>
import { useReactiveTab } from 'vue3-router-tab'
import { ref } from 'vue'

const user = ref({ name: 'John Doe', status: 'online' })

const { 
  routeTabTitle, 
  routeTabIcon, 
  routeTabClosable 
} = useReactiveTab({
  title: () => `${user.value.name} - ${user.value.status}`,
  icon: () => user.value.status === 'online' ? 'mdi-account' : 'mdi-account-off',
 closable: () => user.value.status !== 'editing'
})
</script>
```

### Important Notes

1. **Automatic Exposure in `<script setup>`**: Properties defined in `<script setup>` are automatically exposed - no need for `defineExpose()`
2. **Reactive types**: Use `ref()` or `computed()` - plain values won't trigger updates
3. **Automatic watching**: No manual watchers needed - the plugin handles everything
4. **Performance**: Only active tab components are watched to minimize overhead

#### Works inside KeepAlive and wrappers

`<router-tab>` forwards the tab bindings even when your pages are wrapped for caching. Just expose reactive values (refs/computed) and they will still be watched:

```vue
<script setup>
import { computed, ref } from 'vue'

const count = ref(3)
const isLoading = ref(false)

const routeTabTitle = computed(() => isLoading.value ? 'Loading orders…' : `Orders (${count.value})`)
const routeTabIcon = computed(() => isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-cart')
const routeTabClosable = computed(() => !isLoading.value)
</script>
```

> 💡 **Try it yourself**: Check out the live demo at `/title-test` in the example app to see all these features in action!

### Options API Support

If you're using the Options API, you need to expose the properties:

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const routeTabTitle = ref('My Page')
    const routeTabIcon = computed(() => 'mdi-page')
    
    return {
      routeTabTitle,
      routeTabIcon
    }
  }
}
</script>
```

Or with `defineExpose`:

```vue
<script setup>
import { ref } from 'vue'

const routeTabTitle = ref('My Page')

// Only needed if you're NOT using top-level refs in <script setup>
defineExpose({ routeTabTitle })
</script>
```

**Note**: With `<script setup>`, top-level bindings are automatically exposed, so `defineExpose` is typically not needed.

### Tab Closing Behavior

When a tab is closed, the plugin automatically navigates to the next available tab with the following priority:

1. **Next tab** - The tab immediately to the right
2. **Previous tab** - The tab immediately to the left  
3. **First tab** - If no adjacent tabs exist
4. **Default route** - If no other tabs exist

## Cookie persistence

`<router-tab cookie-key="…" />` is usually all you need. If you prefer fine grained control (custom expiry, same-site, etc.) you can still use the headless helper:

```vue
<router-tab>
  <template #start>
    <router-tabs
      cookie-key="app-tabs"
      :expires-in-days="14"
      fallback-route="/dashboard"
    />
  </template>
</router-tab>
```

Want to wire it up yourself?

```ts
<script setup lang="ts">
import { useRouterTabsPersistence } from 'vue3-router-tab'

useRouterTabsPersistence({
  cookieKey: 'app-tabs',
  expiresInDays: 30,
  fallbackRoute: '/dashboard'
})
</script>
```
The composable also exposes `serialize` / `deserialize` options so you can encrypt or customise the cookie payload.
Use `storage: 'localStorage'` or provide a custom storage adapter when cookies are not a good fit. `debounceMs` can reduce repeated writes during rapid tab changes.

## Theme system

The plugin initialises a lightweight theme layer on install:

- Reads `tab-theme-style` (`'light'`, `'dark'`, or `'system'`; defaults to `'system'`).
- Reads `tab-theme-primary-color` (defaults to `#0f172a`).
- Applies the choice via `data-theme` and `--theme-primary` CSS variables, keeping “system” in sync with OS changes.

Override the theme at runtime:

```ts
import { setRouterTabsTheme, setRouterTabsPrimary } from 'vue3-router-tab'

setRouterTabsTheme('dark')
setRouterTabsPrimary('#22c55e')
```

Customise the defaults with:

```ts
import { initRouterTabsTheme } from 'vue3-router-tab'

initRouterTabsTheme({
  defaultStyle: 'dark',
  defaultPrimary: '#0ea5e9'
})
```

### Custom rendering

You can override the default routed view by providing a `#default` slot. The slot receives the same values you would normally get from `<RouterView v-slot>`:

```vue
<router-tab cookie-key="app-tabs">
  <template #default="{ Component, route }">
    <Suspense>
      <component :is="Component" :key="route.fullPath" />
    </Suspense>
  </template>
</router-tab>
```

## Advanced Features

### Tab Sorting

Enable drag-and-drop tab reordering with the `sortable` prop:

```vue
<router-tab 
  :sortable="true"
  @tab-sort="onTabSort"
  @tab-sorted="onTabSorted"
/>
```



### Persistence Options

Fine-grained control over tab persistence:

```vue
<router-tab 
  :persistence="{
    cookieKey: 'my-app-tabs',
    storage: 'localStorage',
    debounceMs: 100,
    expiresInDays: 30,
    fallbackRoute: '/dashboard',
    serialize: (snapshot) => btoa(JSON.stringify(snapshot)),
    deserialize: (data) => JSON.parse(atob(data))
  }"
/>
```

## Customising the Context Menu

```vue
<router-tab
  :contextMenu="[
    'refresh',
    'close',
    { id: 'closeOthers', label: 'Close All Others' },
    {
      id: 'openWindow',
      label: 'Open in new window',
      handler: ({ target }) => window.open(target.to, '_blank')
    }
  ]"
/>
```

Pass `false` to disable the context menu entirely.

### Built-in Menu Items

- `refresh` - Refresh current tab
- `refreshAll` - Refresh all tabs  
- `close` - Close current tab
- `closeLefts` - Close tabs to the left
- `closeRights` - Close tabs to the right
- `closeOthers` - Close all other tabs

## Programmatic API

Access the router tabs controller to programmatically manage tabs.

### Using the Composable

```vue
<script setup>
import { useRouterTabs } from 'vue3-router-tab'

const tabs = useRouterTabs()

// Available methods
tabs.openTab('/users')              // Open a tab
tabs.closeTab(tabId)                // Close a specific tab
tabs.refreshTab(tabId)              // Refresh a tab
tabs.refreshAll()                   // Refresh all tabs
tabs.closeAll()                     // Close all tabs
tabs.closeOthers(tabId)             // Close all except specified tab
</script>
```

### Using Global Property

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const tabs = instance?.appContext.config.globalProperties.$tabs

// Same methods available
tabs?.openTab('/dashboard')
tabs?.refreshTab('users-123')
</script>
```

### Controller Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `openTab(to, active?, replace?)` | Route location, activate flag, replace flag | Open or activate a tab |
| `closeTab(id, options?)` | Tab ID, close options | Close a specific tab |
| `refreshTab(id, force?)` | Tab ID, force flag | Refresh tab component |
| `refreshAll(force?)` | Force flag | Refresh all tabs |
| `closeAll(options?)` | Close options | Close all closable tabs |
| `closeOthers(id, options?)` | Tab ID, options | Close all tabs except specified |
| `removeTab(id, options?)` | Tab ID, options | Remove tab without navigation |

### Example: Custom Tab Controls

```vue
<template>
  <div>
    <button @click="openDashboard">Open Dashboard</button>
    <button @click="refreshCurrent">Refresh Current</button>
    <button @click="closeAllTabs">Close All</button>
  </div>
</template>

<script setup>
import { useRouterTabs } from 'vue3-router-tab'
import { useRoute } from 'vue-router'

const tabs = useRouterTabs()
const route = useRoute()

function openDashboard() {
  tabs.openTab('/dashboard', true)
}

function refreshCurrent() {
  const currentTab = tabs.tabs.find(t => t.to.path === route.path)
  if (currentTab) {
    tabs.refreshTab(currentTab.id, true)
  }
}

function closeAllTabs() {
  tabs.closeAll({ force: true })
}
</script>
```

### Tab State Access

```vue
<script setup>
import { useRouterTabs } from 'vue3-router-tab'

const controller = useRouterTabs()

</script>
```

## Events

RouterTab emits events for tab interactions.

### Available Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tab-sort` | `{ tab, index }` | Fired when tab drag starts |
| `tab-sorted` | `{ tab, fromIndex, toIndex }` | Fired when tab is dropped in new position |

### Usage Example

```vue
<template>
  <router-tab 
    @tab-sort="onTabSort"
    @tab-sorted="onTabSorted"
  />
</template>

<script setup>
function onTabSort({ tab, index }) {
  console.log('Dragging tab:', tab.title, 'from index:', index)
}

function onTabSorted({ tab, fromIndex, toIndex }) {
  console.log('Tab moved:', tab.title)
  console.log('From:', fromIndex, 'To:', toIndex)
  
  // Save new order to backend
  saveTabOrder(tab, toIndex)
}
</script>
```

## Slots

- `start` / `end` – positioned on either side of the tab list (ideal for toolbars or the `<router-tabs>` helper).
- `default` – routed content (rendered automatically by `<router-tab>`).

## Styling

The package ships with its own CSS bundle (imported automatically). Override CSS custom properties or the `router-tab__*` classes to customize the appearance.

### CSS Custom Properties

```css
:root {
  /* Layout */
  --router-tab-header-height: 48px;
  --router-tab-sticky-top: 0px;
  --router-tab-header-z-index: 10;
  --router-tab-padding: 16px;
  --router-tab-font-size: 14px;
  
  /* Colors */
  --router-tab-primary: #0f172a;
  --router-tab-background: #ffffff;
  --router-tab-text: #334155;
  --router-tab-border: #e2e8f0;
  --router-tab-active-background: #0f172a;
  --router-tab-active-text: #ffffff;
  
  /* Icons & Buttons */
  --router-tab-icon-color: #64748b;
  --router-tab-button-background: #f1f5f9;
  --router-tab-button-color: #0f172a;
}
```

When `router-tab` is rendered below a fixed app header, set `--router-tab-sticky-top` so the sticky bar locks beneath that header instead of sliding under it:

```vue
<router-tab class="app-router-tab" />
```

```css
.app-router-tab {
  --router-tab-sticky-top: var(--v-layout-top, 0px);
}
```

### Custom Styles Example

```css
/* Change tab height */
.router-tab__header {
  height: 56px;
}

/* Custom tab hover effect */
.router-tab__item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Custom active tab */
.router-tab__item.is-active {
  background: #4f46e5;
  border-radius: 8px 8px 0 0;
}

/* Custom close button */
.router-tab__item-close {
  border-radius: 4px;
}

/* Dark theme adjustments */
[data-theme="dark"] .router-tab {
  --router-tab-background: #1e293b;
  --router-tab-text: #f1f5f9;
  --router-tab-border: #334155;
}
```

## Types

```ts
import type { TabRecord, RouterTabsSnapshot, RouterTabsPersistenceOptions } from 'vue3-router-tab'
```

## Examples

Check out the [example-app](./example-app) directory for comprehensive demos including:

- **Basic Usage** - Simple tab navigation
- **Dynamic Titles** - Reactive tab title updates ([/title-test](./example-app/src/views/TitleTestDemo.vue))
- **Transitions** - All 7 transition effects ([/transition-demo](./example-app/src/views/TransitionDemo.vue))
- **Composables** - Using helper composables ([/composable-demo](./example-app/src/views/ComposableDemo.vue))
- **Advanced Features** - Sorting, context menus, persistence

### Run Examples

```bash
cd example-app
npm install
npm run dev
```

## Troubleshooting

### Tab titles not updating

**Problem**: Tab title doesn't change when component state updates.

**Solution**: Ensure you're using reactive refs or computed properties:

```vue
<!-- ✅ Correct -->
<script setup>
const routeTabTitle = ref('My Page')  // Reactive
</script>

<!-- ❌ Wrong -->
<script setup>
const routeTabTitle = 'My Page'  // Plain string - won't update
</script>
```

### Transitions not working

**Problem**: Page transitions don't show when refreshing tabs.

**Solution**: Make sure you're not using a custom default slot that overrides transitions. Remove the custom slot or include transition components:

```vue
<!-- ✅ Default behavior with transitions -->
<router-tab page-transition="router-tab-fade" />

<!-- ❌ Custom slot without transitions -->
<router-tab>
  <template #default="{ Component }">
    <component :is="Component" />  <!-- No transition! -->
  </template>
</router-tab>

<!-- ✅ Custom slot with transitions -->
<router-tab>
  <template #default="{ Component }">
    <transition name="router-tab-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </template>
</router-tab>
```

### Tabs not persisting on refresh

**Problem**: Tabs are lost when refreshing the browser.

**Solution**: Add the `cookie-key` prop:

```vue
<router-tab cookie-key="my-app-tabs" />
```

Check that cookies are enabled in the browser and not being blocked.

### KeepAlive not working

**Problem**: Component state is lost when switching tabs.

**Solution**: Ensure `:keep-alive="true"` (default) and components are properly keyed:

```ts
// In router config
meta: {
  keepAlive: true,  // Enable for this route
  key: 'fullPath'   // Unique key per instance
}
```

### TypeScript errors

**Problem**: TypeScript shows errors for router tab properties.

**Solution**: Import types and use them:

```ts
import type { TabRecord, RouterTabsOptions } from 'vue3-router-tab'

const options: RouterTabsOptions = {
  keepAlive: true,
  maxAlive: 10
}
```

## Browser Support

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Modern mobile browsers

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

---

Made with ❤️ by the Vue community

import { createApp } from 'vue'
import App from './App.vue'
import BaseAPIService from '@/services/BaseAPIService'

import '@styles/template/index.scss'
import '@/assets/styles/styles.scss'

import { registerPlugins } from '@/utils/plugins'

import Vue3Notification from "vue3-notification"
import { initSnotifyHelper } from '@/composable/useSnotify'
import Vue3ConfirmDialogBox from "vue3-confirm-dialog-box"
import 'vue3-perfect-scrollbar/style.css'

const app = createApp(App)

// Use plugins
BaseAPIService.init(app)

app.use(Vue3Notification)
app.use(Vue3ConfirmDialogBox, { componentName: 'Vue3ConfirmDialogBox' })

// vue3-notification exposes $snotify on globalProperties
initSnotifyHelper((app.config.globalProperties as any).$snotify)

// Register plugins
registerPlugins(app)

app.mount('#app')

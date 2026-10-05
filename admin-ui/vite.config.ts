import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath } from 'node:url'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000'

  return {
    // Served by the portfolio's Express server (and Netlify) under /admin
    base: '/admin/',
    plugins: [
      vue(),
      vuetify(),
      svgLoader(),
      VueDevTools(),
      Components({
        dirs: ['src/components', 'src/views/components', 'src/core/components'],
        dts: true,
      }),
      AutoImport({
        imports: [
          'vue',
          VueRouterAutoImports,
          '@vueuse/core',
          'pinia',
        ],
        dirs: [
          './src/composable/**',
          './src/utils/**',
        ],
        dts: true,
        vueTemplate: true,
        ignore: [
          'useCookie',
          'useStorage',
          'useClipboard',
        ],
      }),
    ],

    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/assets/styles', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
        '@theme-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
      },
    },
    server: {
      port: 4010,

      // Forward API calls and uploaded files to the portfolio's Express server in development
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      // Express and Netlify serve the built admin from ../admin
      outDir: '../admin',
      emptyOutDir: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vuetify'))
                return 'vendor-vuetify'

              if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/'))
                return 'vendor-vue'
            }
          },
        },
      },
    },
  }
})

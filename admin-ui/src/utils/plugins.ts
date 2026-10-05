import type { App } from 'vue'

export const registerPlugins = (app: App) => {
  const imports = import.meta.glob<{ default: (app: App) => void }>(['../plugins/*.{ts,js}', '../plugins/*/index.{ts,js}'], { eager: true })
  const importPaths = Object.keys(imports).sort()

  importPaths.forEach(path => {
    const pluginImportModule = imports[path]

    if (pluginImportModule?.default)
      pluginImportModule.default(app)
  })
}

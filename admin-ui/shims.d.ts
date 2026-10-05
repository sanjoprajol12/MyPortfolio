
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'webfontloader' {
  const WebFont: any
  export default WebFont
}

declare module '@iconify/types' {
  export interface IconifyJSON { [key: string]: any }
}

declare module 'vue3-confirm-dialog-box' {
  import type { Plugin } from 'vue'

  export interface ConfirmDialogButton {
    yes?: string;
    no?: string | null;
  }

  export interface ConfirmDialogOptions {
    title?: string;
    message?: string;
    button?: ConfirmDialogButton;
    auth?: boolean;
    authPlaceholder?: string;
    callback?: (confirmed: boolean, password?: string) => void;
  }

  export interface ConfirmDialogResult {
    confirmed: boolean;
    password?: string;
  }

  export interface ConfirmFunction {
    (options?: ConfirmDialogOptions): Promise<ConfirmDialogResult>;
    close(): void;
    setDefaults?(defaults: Partial<ConfirmDialogOptions>): void;
  }

  export interface PluginOptions {
    componentName?: string;
  }

  const Vue3ConfirmDialogBox: Plugin<PluginOptions>
  export default Vue3ConfirmDialogBox
}

declare module 'vue3-notification' {
  import type { App } from 'vue'
  export interface SnotifyLike {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }

  interface SnotifyDefaults {
    [key: string]: unknown
  }

  const plugin: {
    install: (app: App, options?: SnotifyDefaults) => void
  }

  export default plugin
}

declare module '@vuelidate/validators' {
  export const required: any
  export const requiredIf: any
  export const requiredUnless: any
  export const email: any
  export const minLength: any
  export const maxLength: any
  export const numeric: any
  export const integer: any
  export const decimal: any
  export const between: any
  export const alpha: any
  export const alphaNum: any
  export const url: any
  export const ipAddress: any
  export const sameAs: any
  export const minValue: any
  export const maxValue: any
  export const helpers: {
    withMessage: (message: string, validator: any) => any
  }
}

declare module '@vuelidate/core' {
  export function useVuelidate(rules?: any, state?: any, options?: any): any
}

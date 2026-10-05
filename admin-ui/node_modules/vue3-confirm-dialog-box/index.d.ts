import type { App, Plugin } from 'vue';

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
  setDefaults(defaults: Partial<ConfirmDialogOptions>): void;
}

export interface PluginOptions {
  componentName?: string;
}

// Plugin declaration
declare const Vue3ConfirmDialogBox: Plugin<PluginOptions>;

export default Vue3ConfirmDialogBox;

// Vue module augmentation
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $confirm: ConfirmFunction;
  }
  
  interface GlobalProperties {
    $confirm: ConfirmFunction;
  }
}

// For injection
declare module 'vue' {
  interface ComponentCustomProperties {
    $confirm: ConfirmFunction;
  }
  
  interface GlobalProperties {
    $confirm: ConfirmFunction;
  }
}
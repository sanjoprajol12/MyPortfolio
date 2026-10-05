export {}

// Third-party packages without type definitions
declare module 'webfontloader' {
  const WebFont: any
  export default WebFont
}

declare module '@iconify/types' {
  export interface IconifyJSON { [key: string]: any }
}

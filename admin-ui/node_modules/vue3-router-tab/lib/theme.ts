const STYLE_KEY = 'tab-theme-style'
const PRIMARY_KEY = 'tab-theme-primary-color'
const DEFAULT_STYLE: 'light' | 'dark' | 'system' = 'system'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

let mediaListener: ((event: MediaQueryListEvent) => void) | null = null

export interface RouterTabsThemeOptions {
  styleKey?: string
  primaryKey?: string
  defaultStyle?: 'light' | 'dark' | 'system'
  defaultPrimary?: string
}
export interface ColorStyle {
 // Core colors
  primary: string;
  background: string;
  text: string;
  border: string;
  
  // Interactive states
  activeBackground: string;
  activeText: string;
  activeBorder: string;
  
  // Header specific
  headerBackground: string;
  
  // Button specific
  buttonBackground: string;
  buttonColor: string;
  activeButtonBackground: string;
  activeButtonColor: string;
  
  // Icon specific
  iconColor: string;
}

const defaultColors: ColorStyle = {
  primary: "#034960",
  background: "#ffffff",
  text: "#1e293b",
  border: "#e2e8f0",
  
  activeBackground: "#034960",
  activeText: "#ffffff",
  activeBorder: "#034960",
  
  headerBackground: "#ffffff",
  
  buttonBackground: "#f8fafc",
  buttonColor: "#034960",
  activeButtonBackground: "#034960",
  activeButtonColor: "#ffffff",
  
  iconColor: "#475569",
}

const defaultDarkColor: ColorStyle = {
  primary: "#38bdf8",
  background: "#0f172a",
  text: "#f1f5f9",
  border: "#334155",
  
  activeBackground: "#1e293b",
  activeText: "#38bdf8",
  activeBorder: "#38bdf8",
  
  headerBackground: "#0c4a6e", // Darker shade of primary
  
  buttonBackground: "#1e293b",
  buttonColor: "#f1f5f9",
  activeButtonBackground: "#38bdf8",
  activeButtonColor: "#0f172a",
  
  iconColor: "#cbd5e1",
}

function readStoredPrimary(key: string): Partial<ColorStyle> | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<ColorStyle>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn('[RouterTabs] Failed to parse stored primary color palette', error)
    }
    return null
  }
}

function applyPrimary(color: ColorStyle) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--router-tab-primary', color.primary ?? defaultColors.primary)
  document.documentElement.style.setProperty('--router-tab-header-bg', color.headerBackground ?? defaultColors.headerBackground)
  document.documentElement.style.setProperty('--router-tab-background', color.background ?? defaultColors.background)
  document.documentElement.style.setProperty('--router-tab-active-background', color.activeBackground ?? defaultColors.activeBackground)
  document.documentElement.style.setProperty('--router-tab-text', color.text ?? defaultColors.text)
  document.documentElement.style.setProperty('--router-tab-active-text', color.activeText ?? defaultColors.activeText)
  document.documentElement.style.setProperty('--router-tab-border', color.border ?? defaultColors.border)
  document.documentElement.style.setProperty('--router-tab-active-border', color.activeBorder ?? defaultColors.activeBorder)
  document.documentElement.style.setProperty('--router-tab-button-color', color.buttonColor ?? defaultColors.buttonColor)
  document.documentElement.style.setProperty('--router-tab-active-button-color', color.activeButtonColor ?? defaultColors.activeButtonColor)
  document.documentElement.style.setProperty('--router-tab-button-background', color.buttonBackground ?? defaultColors.buttonBackground)
  document.documentElement.style.setProperty('--router-tab-active-button-background', color.activeButtonBackground ?? defaultColors.activeButtonBackground)
  document.documentElement.style.setProperty('--router-tab-icon-color', color.iconColor ?? defaultColors.iconColor)
}

function applyStyle(style: 'light' | 'dark' | 'system') {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const media = window.matchMedia(MEDIA_QUERY)

  const updateFromSystem = () => {
    root.dataset.theme = media.matches ? 'dark' : 'light'
  }

  if (mediaListener) {
    media.removeEventListener('change', mediaListener)
    mediaListener = null
  }

  if (style === 'system') {
    updateFromSystem()
    mediaListener = () => updateFromSystem()
    media.addEventListener('change', mediaListener)
  } else {
    root.dataset.theme = style
  }
}

export function initRouterTabsTheme(options: RouterTabsThemeOptions = {}) {
  if (typeof window === 'undefined') return

  const {
    styleKey = STYLE_KEY,
    primaryKey = PRIMARY_KEY,
    defaultStyle = DEFAULT_STYLE,
    defaultPrimary
  } = options

  const storedStyle = (window.localStorage.getItem(styleKey) as 'light' | 'dark' | 'system' | null) ?? defaultStyle

  applyStyle(storedStyle)

  const prefersDark =
    storedStyle === 'dark' ||
    (storedStyle === 'system' && window.matchMedia(MEDIA_QUERY).matches)

  const basePalette = prefersDark
    ? { ...defaultDarkColor }
    : { ...defaultColors }

  if (defaultPrimary) {
    basePalette.primary = defaultPrimary
  }

  const storedPrimary = readStoredPrimary(primaryKey)

  if (storedPrimary) {
    applyPrimary({
      ...basePalette,
      ...storedPrimary
    })
  } else {
    applyPrimary(basePalette)
  }
}

export function setRouterTabsTheme(style: 'light' | 'dark' | 'system', options?: RouterTabsThemeOptions) {
  if (typeof window === 'undefined') return
  const key = options?.styleKey ?? STYLE_KEY
  window.localStorage.setItem(key, style)
  applyStyle(style)
}

export function setRouterTabsPrimary(color: ColorStyle, options?: RouterTabsThemeOptions) {
  if (typeof window === 'undefined') return
  const key = options?.primaryKey ?? PRIMARY_KEY
  window.localStorage.setItem(key, JSON.stringify(color))
  applyPrimary(color)
}

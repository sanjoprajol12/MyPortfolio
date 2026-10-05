import type { ThemeDefinition } from 'vuetify'

// Portfolio palette: the site's gold accent (#D4A853) on slate neutrals.
// The light theme uses a deeper gold so primary text and white button labels stay readable.
export const staticPrimaryColor = '#9A7023'
export const staticPrimaryDarkenColor = '#7D5A1A'
export const staticSecondaryColor = '#475569'
export const staticSecondaryDarkenColor = '#334155'

export const themes: Record<string, ThemeDefinition> = {
  light: {
    dark: false,
    colors: {
      // Primary Colors
      'primary': staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': staticPrimaryDarkenColor,

      // Secondary Colors
      'secondary': staticSecondaryColor,
      'secondary-darken-1': staticSecondaryDarkenColor,
      'on-secondary': '#fff',

      // Accent Color (the site's gold)
      'accent': '#D4A853',
      'accent-darken-1': '#9A7023',
      'on-accent': '#fff',

      // Status Colors
      'success': '#16A34A',
      'success-darken-1': '#15803D',
      'info': '#0284C7',
      'info-darken-1': '#0369A1',
      'warning': '#D97706',
      'warning-darken-1': '#B45309',
      'error': '#DC2626',
      'error-darken-1': '#B91C1C',
      'on-success': '#fff',
      'on-info': '#fff',
      'on-warning': '#fff',
      'on-error': '#fff',

      // Background & Surface
      'background': '#F8FAFC',
      'on-background': '#0B131F',
      'surface': '#FFFFFF',
      'on-surface': '#0B131F',

      // Grey Scale (Slate)
      'grey-50': '#F8FAFC',
      'grey-100': '#F1F5F9',
      'grey-200': '#E2E8F0',
      'grey-300': '#CBD5E1',
      'grey-400': '#94A3B8',
      'grey-500': '#64748B',
      'grey-600': '#475569',
      'grey-700': '#334155',
      'grey-800': '#1E293B',
      'grey-900': '#0F172A',

      // Legacy/Custom Colors
      'perfect-scrollbar-thumb': '#CBD5E1',
      'skin-bordered-background': '#F8FAFC',
      'skin-bordered-surface': '#FFFFFF',
      'expansion-panel-text-custom-bg': '#F8FAFC',
      'track-bg': '#F1F5F9',
      'chat-bg': '#F8FAFC',
    },

    variables: {
      'code-color': '#9A7023',
      'overlay-scrim-background': '#0B131F',
      'tooltip-background': '#0B131F',
      'overlay-scrim-opacity': 0.5,
      'hover-opacity': 0.04,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.1,
      'disabled-opacity': 0.4,
      'border-color': '#0F172A',
      'border-opacity': 0.1,
      'table-header-color': '#F8FAFC',
      'high-emphasis-opacity': 0.92,
      'medium-emphasis-opacity': 0.66,

      // Shadows
      'shadow-key-umbra-color': '#0F172A',
      'shadow-xs-opacity': '0.10',
      'shadow-sm-opacity': '0.12',
      'shadow-md-opacity': '0.14',
      'shadow-lg-opacity': '0.16',
      'shadow-xl-opacity': '0.18',
    },
  },

  dark: {
    dark: true,
    colors: {
      // Primary Colors (the site's own gold reads well on dark surfaces)
      'primary': '#D4A853',
      'on-primary': '#0B131F',
      'primary-darken-1': '#B58C3C',

      // Secondary Colors
      'secondary': '#94A3B8',
      'secondary-darken-1': '#64748B',
      'on-secondary': '#0B131F',

      // Accent Color
      'accent': '#D4A853',
      'accent-darken-1': '#B58C3C',
      'on-accent': '#0B131F',

      // Status Colors (brighter for dark mode)
      'success': '#4ADE80',
      'success-darken-1': '#22C55E',
      'on-success': '#0B131F',
      'info': '#38BDF8',
      'info-darken-1': '#0EA5E9',
      'on-info': '#0B131F',
      'warning': '#FBBF24',
      'warning-darken-1': '#F59E0B',
      'on-warning': '#0B131F',
      'error': '#F87171',
      'error-darken-1': '#EF4444',
      'on-error': '#0B131F',

      // Background & Surface (brand dark + slate)
      'background': '#0B131F',
      'on-background': '#F1F5F9',
      'surface': '#111A2B',
      'on-surface': '#F1F5F9',

      // Grey Scale (inverted Slate)
      'grey-50': '#111A2B',
      'grey-100': '#1E293B',
      'grey-200': '#334155',
      'grey-300': '#475569',
      'grey-400': '#64748B',
      'grey-500': '#94A3B8',
      'grey-600': '#CBD5E1',
      'grey-700': '#E2E8F0',
      'grey-800': '#F1F5F9',
      'grey-900': '#FFFFFF',

      // Legacy/Custom Colors
      'perfect-scrollbar-thumb': '#334155',
      'skin-bordered-background': '#0B131F',
      'skin-bordered-surface': '#111A2B',
      'expansion-panel-text-custom-bg': '#1E293B',
      'track-bg': '#1E293B',
      'chat-bg': '#111A2B',
    },

    variables: {
      'code-color': '#D4A853',
      'overlay-scrim-background': '#020617',
      'tooltip-background': '#F1F5F9',
      'overlay-scrim-opacity': 0.6,
      'hover-opacity': 0.04,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'disabled-opacity': 0.4,
      'dragged-opacity': 0.1,
      'border-color': '#F1F5F9',
      'border-opacity': 0.1,
      'table-header-color': '#152033',
      'high-emphasis-opacity': 0.92,
      'medium-emphasis-opacity': 0.68,

      // Shadows
      'shadow-key-umbra-color': '#020617',
      'shadow-xs-opacity': '0.20',
      'shadow-sm-opacity': '0.22',
      'shadow-md-opacity': '0.24',
      'shadow-lg-opacity': '0.26',
      'shadow-xl-opacity': '0.28',
    },
  },
}

export default themes

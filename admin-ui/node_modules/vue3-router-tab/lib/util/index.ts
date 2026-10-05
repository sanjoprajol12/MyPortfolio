import type { TransitionLike } from '../core/types'

export const emptyArray: never[] = []

export function getTransOpt(trans?: TransitionLike): Record<string, unknown> {
  if (!trans) return {}
  return typeof trans === 'string' ? { name: trans } : trans
}

export function normalizeClass(value: unknown): Record<string, boolean> {
  if (!value) return {}
  if (typeof value === 'string') {
    return value.split(/\s+/).reduce<Record<string, boolean>>((acc, cls) => {
      if (cls) acc[cls] = true
      return acc
    }, {})
  }
  if (Array.isArray(value)) {
    return value.reduce<Record<string, boolean>>((acc, item) => {
      Object.assign(acc, normalizeClass(item))
      return acc
    }, {})
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, boolean>).reduce<Record<string, boolean>>(
      (acc, [key, val]) => {
        if (val) acc[key] = true
        return acc
      },
      {}
    )
  }
  return {}
}

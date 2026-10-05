// Collections that carry a sort_order are listed in that order on the website.
export const bySortOrder = <T extends { sort_order?: number }>(a: T, b: T) =>
  (a.sort_order ?? 0) - (b.sort_order ?? 0)

// Stable client-side id for array items the API stores without one.
export const generateId = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`

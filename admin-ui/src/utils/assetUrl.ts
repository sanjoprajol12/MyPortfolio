const ASSET_BASE = (import.meta.env.VITE_ASSET_URL || '').replace(/\/+$/, '')

/**
 * Uploaded files are stored as "/uploads/<file>" relative to the API server.
 * Prefix them with VITE_ASSET_URL when the admin runs on a different origin.
 */
export const resolveAssetUrl = (path?: string | null) => {
  if (!path)
    return ''

  if (/^(https?:|data:|blob:)/i.test(path) || !ASSET_BASE)
    return path

  return `${ASSET_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

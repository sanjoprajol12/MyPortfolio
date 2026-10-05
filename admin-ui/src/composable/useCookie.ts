import type { CookieParseOptions, CookieSerializeOptions } from 'cookie-es'
import { parse, serialize } from 'cookie-es'
import { destr } from 'destr'

type _CookieOptions = Omit<CookieSerializeOptions & CookieParseOptions, 'decode' | 'encode'>

export interface CookieOptions<T> extends _CookieOptions {
  decode?(value: string): T
  encode?(value: T): string
  default?: () => T | Ref<T>
  watch?: boolean | 'shallow'
}

export type CookieRef<T> = Ref<T>

const CookieDefaults: CookieOptions<unknown> = {
  path: '/',
  watch: true,
  decode: val => destr(decodeURIComponent(val)),
  encode: val => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
}

export const useCookie = <T = string | null | undefined>(name: string, _opts?: CookieOptions<T>): CookieRef<T> => {
  const opts = { ...CookieDefaults, ..._opts || {} }

  // Read the raw value and decode it with the same scheme `encode` wrote it with,
  // so stored booleans/numbers come back typed ("false" must not read as truthy).
  const rawValue = parse(document.cookie, { decode: val => val })[name]

  const cookie = ref<T | undefined>(rawValue !== undefined ? opts.decode!(rawValue) as T : opts.default?.() as T | undefined)

  watch(cookie, () => {
    document.cookie = serializeCookie(name, cookie.value, opts)
  })

  return cookie as CookieRef<T>
}

function serializeCookie(name: string, value: string, opts: CookieSerializeOptions = {}) {
  if (value === null || value === undefined)
    return serialize(name, value, { ...opts, maxAge: -1 })

  return serialize(name, value, opts)
}

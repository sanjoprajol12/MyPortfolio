import type { LiteralUnion } from 'type-fest'

export const resolveVuetifyTheme = (defaultTheme: LiteralUnion<'light' | 'dark' | 'system', string>): 'light' | 'dark' => {
  const cookieColorScheme = cookieRef<'light' | 'dark'>('theme-style', usePreferredDark().value ? 'dark' : 'light')
  const storedTheme = cookieRef('theme-style', defaultTheme).value

  return storedTheme === 'system'
    ? cookieColorScheme.value === 'dark'
      ? 'dark'
      : 'light'
    : storedTheme as 'light' | 'dark'
}

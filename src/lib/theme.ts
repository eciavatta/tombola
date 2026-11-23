export const THEMES = [
  { id: 'light', label: 'Chiaro' },
  { id: 'dark', label: 'Scuro' },
  { id: 'christmas', label: 'Natale' },
  { id: 'contrast', label: 'Alto contrasto' },
] as const

export type Theme = (typeof THEMES)[number]['id']
/** `auto` follows the light/dark preference of the operating system. */
export type ThemePreference = Theme | 'auto'

/** Keep in sync with the inline script in index.html, which applies the theme before React loads. */
export const THEME_STORAGE_KEY = 'tombola.theme'

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === 'auto' || THEMES.some((theme) => theme.id === value)
    ? (value as ThemePreference)
    : 'auto'
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): Theme {
  if (preference !== 'auto') return preference
  return prefersDark ? 'dark' : 'light'
}

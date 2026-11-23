import { useEffect } from 'react'
import {
  DARK_SCHEME_QUERY,
  normalizeThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../lib/theme'
import { useLocalStorage } from './useLocalStorage'

/** Stores the theme preference and applies it to the document. */
export function useTheme() {
  const [preference, setPreference] = useLocalStorage<ThemePreference>(
    THEME_STORAGE_KEY,
    'auto',
    normalizeThemePreference,
  )

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY)
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(preference, media.matches)
    }
    apply()
    // In automatic mode, follow changes of the system preference.
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  return [preference, setPreference] as const
}

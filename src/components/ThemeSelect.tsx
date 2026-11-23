import { useTheme } from '../hooks/useTheme'
import { trackEvent } from '../lib/analytics'
import { withViewTransition } from '../lib/motion'
import { DARK_SCHEME_QUERY, normalizeThemePreference, resolveTheme, THEMES } from '../lib/theme'

export function ThemeSelect() {
  const [preference, setPreference] = useTheme()

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Tema</span>
      <select
        value={preference}
        onChange={(event) => {
          const next = normalizeThemePreference(event.target.value)
          withViewTransition(() => {
            // Applied right away (not in the effect), so the transition captures the new colors.
            const prefersDark = window.matchMedia(DARK_SCHEME_QUERY).matches
            document.documentElement.dataset.theme = resolveTheme(next, prefersDark)
          })
          setPreference(next)
          trackEvent('change_theme', { theme: next })
        }}
        className="cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg focus:outline-2 focus:outline-accent"
      >
        <option value="auto">Automatico</option>
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * Google Analytics 4, loaded only after the user consents.
 * The measurement ID comes from the build environment (VITE_GA_MEASUREMENT_ID).
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || undefined

export const isAnalyticsConfigured = MEASUREMENT_ID !== undefined

export type AnalyticsConsent = 'granted' | 'denied' | null

export const normalizeConsent = (value: unknown): AnalyticsConsent =>
  value === 'granted' || value === 'denied' ? value : null

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let isLoaded = false

export function enableAnalytics(): void {
  if (!MEASUREMENT_ID) return
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = false
  if (isLoaded) return
  isLoaded = true

  window.dataLayer = window.dataLayer ?? []
  // gtag.js expects the `arguments` object itself, not an array.
  window.gtag = function gtag() {
    // oxlint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

/** Stops sending data and removes the Google Analytics cookies. */
export function disableAnalytics(): void {
  if (!MEASUREMENT_ID) return
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = true

  const hostParts = window.location.hostname.split('.')
  // GA sets its cookies on the widest possible domain: try every parent domain.
  const domains = hostParts.map((_, i) => hostParts.slice(i).join('.'))
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    document.cookie = `${name}=; Max-Age=0; path=/`
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`
  }
}

/** Sends a custom event; does nothing without consent or configuration. */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (isLoaded && window.gtag) window.gtag('event', name, params)
}

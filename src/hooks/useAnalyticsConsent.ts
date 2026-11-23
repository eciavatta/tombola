import { useEffect } from 'react'
import {
  disableAnalytics,
  enableAnalytics,
  isAnalyticsConfigured,
  normalizeConsent,
  type AnalyticsConsent,
} from '../lib/analytics'
import { useLocalStorage } from './useLocalStorage'

/** Stores the analytics consent and loads/stops Google Analytics accordingly. */
export function useAnalyticsConsent() {
  const [consent, setConsent] = useLocalStorage<AnalyticsConsent>(
    'tombola.analyticsConsent',
    null,
    normalizeConsent,
  )

  useEffect(() => {
    if (!isAnalyticsConfigured) return
    if (consent === 'granted') enableAnalytics()
    else disableAnalytics()
  }, [consent])

  return [consent, setConsent] as const
}

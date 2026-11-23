import { useSyncExternalStore } from 'react'

const FULLSCREEN_QUERY = '(display-mode: fullscreen)'

/**
 * True when the page is shown full screen: via the Fullscreen API, or via
 * the browser's own full screen mode (F11), which not every browser reports
 * through `display-mode`, hence the window-size check as a fallback.
 */
function isFullscreen(): boolean {
  return (
    document.fullscreenElement !== null ||
    window.matchMedia(FULLSCREEN_QUERY).matches ||
    (window.outerWidth >= window.screen.width && window.outerHeight >= window.screen.height)
  )
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(FULLSCREEN_QUERY)
  document.addEventListener('fullscreenchange', onChange)
  window.addEventListener('resize', onChange)
  media.addEventListener('change', onChange)
  return () => {
    document.removeEventListener('fullscreenchange', onChange)
    window.removeEventListener('resize', onChange)
    media.removeEventListener('change', onChange)
  }
}

export function useFullscreen(): boolean {
  return useSyncExternalStore(subscribe, isFullscreen)
}

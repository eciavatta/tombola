export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Runs a DOM update with a cross-fade, when the browser supports
 * view transitions and the user does not prefer reduced motion.
 */
export function withViewTransition(update: () => void): void {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  document.startViewTransition(update)
}

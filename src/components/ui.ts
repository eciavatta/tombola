/** Shared class names for the flat UI; colors come from the active theme. */

const buttonBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-[color,background-color,border-color,scale] active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40'

export const primaryButtonClass = `${buttonBase} bg-accent text-on-accent hover:bg-accent-hover disabled:hover:bg-accent`

export const secondaryButtonClass = `${buttonBase} border border-line bg-surface text-fg hover:bg-subtle disabled:hover:bg-surface`

export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-fg focus:outline-2 focus:-outline-offset-1 focus:outline-accent'

export const panelClass = 'rounded-xl border border-line bg-surface'

export const labelCapsClass = 'text-xs font-semibold tracking-wider text-muted uppercase'

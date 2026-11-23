import { secondaryButtonClass } from './ui'

export function FullscreenButton() {
  if (!document.fullscreenEnabled) return null

  return (
    <button
      type="button"
      onClick={() => void document.documentElement.requestFullscreen()}
      title="Schermo intero (Esc per uscire)"
      className={`${secondaryButtonClass} px-3 py-1.5 text-sm`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className="size-4"
      >
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </svg>
      <span className="hidden sm:inline">Schermo intero</span>
    </button>
  )
}

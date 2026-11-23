import { useEffect } from 'react'

interface NumberImageOverlayProps {
  value: number
  imageUrl: string
  /** Seconds before closing automatically; 0 keeps it open. */
  timeoutSeconds: number
  onClose: () => void
}

/** Full-screen image for a drawn number; closes on click, on any key or after a timeout. */
export function NumberImageOverlay({
  value,
  imageUrl,
  timeoutSeconds,
  onClose,
}: NumberImageOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Modifier keys alone (e.g. Alt+Tab, screenshots) do not close it.
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const timer = timeoutSeconds > 0 ? window.setTimeout(onClose, timeoutSeconds * 1000) : undefined
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(timer)
    }
  }, [onClose, timeoutSeconds])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Numero ${value}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex animate-fade-in cursor-pointer flex-col items-center justify-center gap-6 bg-black/85 p-6 sm:p-10"
    >
      <img
        key={value}
        src={imageUrl}
        alt=""
        className="max-h-[78vh] max-w-full min-w-0 animate-dialog-in rounded-2xl object-contain"
      />
      <div
        key={`badge-${value}`}
        className="flex animate-number-in items-center gap-4 rounded-full bg-highlight py-2 pr-8 pl-3 text-on-highlight"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-black/15 text-sm font-semibold tracking-wider uppercase">
          N°
        </span>
        <span className="text-6xl leading-none font-bold tabular-nums">{value}</span>
      </div>
      <p className="text-sm text-white/60">Clicca o premi un tasto per chiudere</p>
    </div>
  )
}

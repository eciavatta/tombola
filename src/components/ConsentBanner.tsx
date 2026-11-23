import { panelClass, primaryButtonClass, secondaryButtonClass } from './ui'

interface ConsentBannerProps {
  onChoice: (consent: 'granted' | 'denied') => void
}

/** Asks for consent before loading Google Analytics (cookies). */
export function ConsentBanner({ onChoice }: ConsentBannerProps) {
  return (
    <div
      role="region"
      aria-label="Consenso cookie"
      className={`${panelClass} fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl animate-dialog-in flex-col gap-4 p-5 sm:flex-row sm:items-center presentation:hidden`}
    >
      <p className="flex-1 text-sm text-muted">
        <span className="font-semibold text-fg">Statistiche anonime.</span> Se acconsenti, usiamo
        Google Analytics (con cookie) per capire come viene usato il sito. Nessun dato della tua
        partita viene inviato.
      </p>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => onChoice('denied')} className={secondaryButtonClass}>
          Rifiuta
        </button>
        <button type="button" onClick={() => onChoice('granted')} className={primaryButtonClass}>
          Accetta
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import defaultLogoUrl from '../assets/default-logo.webp'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { normalizeImage, readImage, type LoadedImage } from '../lib/image'
import { panelClass } from './ui'

const MAX_LOGO_SIDE = 1000

/** `null`: default logo; `'none'`: logo hidden; otherwise the uploaded logo. */
type LogoSetting = LoadedImage | 'none' | null

const normalizeLogo = (value: unknown): LogoSetting =>
  value === 'none' ? 'none' : normalizeImage(value)

const linkButtonClass = 'cursor-pointer text-xs font-medium text-muted hover:text-fg'

/** Logo of the evening, shown next to the last drawn number. */
export function EventLogo() {
  const [logo, setLogo, isPersisted] = useLocalStorage<LogoSetting>(
    'tombola.eventLogo',
    null,
    normalizeLogo,
  )
  const [error, setError] = useState<string | null>(null)
  const isCustom = logo !== null && logo !== 'none'

  const fileInput = (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      onChange={async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
          setLogo(await readImage(file, MAX_LOGO_SIDE))
          setError(null)
        } catch {
          setError('Impossibile leggere l’immagine selezionata.')
        }
      }}
      className="hidden"
    />
  )

  const useDefaultButton = (
    <button type="button" onClick={() => setLogo(null)} className={linkButtonClass}>
      Usa logo predefinito
    </button>
  )

  const errorMessage =
    error ?? (isCustom && !isPersisted ? 'Logo troppo grande per essere ricordato dal browser.' : null)

  if (logo === 'none') {
    return (
      <div className="flex flex-col items-center gap-2 presentation:hidden">
        <label className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-5 text-center text-sm text-muted transition-colors hover:border-accent hover:text-fg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="size-6"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-4.5-4.5L5 21" />
          </svg>
          Carica il logo della serata
          {fileInput}
        </label>
        {useDefaultButton}
        {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
      </div>
    )
  }

  return (
    <div className={`${panelClass} p-4`}>
      <img
        src={isCustom ? logo.dataUrl : defaultLogoUrl}
        alt="Logo della serata"
        className="mx-auto max-h-48 w-full animate-fade-in object-contain stage:max-h-[16vh]"
      />
      <div className="mt-3 flex justify-center gap-4 presentation:hidden">
        <label className={linkButtonClass}>
          {isCustom ? 'Cambia' : 'Carica il tuo logo'}
          {fileInput}
        </label>
        {isCustom ? (
          useDefaultButton
        ) : (
          <button type="button" onClick={() => setLogo('none')} className={linkButtonClass}>
            Nascondi
          </button>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 text-center text-xs text-danger presentation:hidden">{errorMessage}</p>
      )}
    </div>
  )
}

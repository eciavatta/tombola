import { useState } from 'react'
import type { ImportResult, NumberImages } from '../hooks/useNumberImages'
import { useConfirm } from './confirm/context'
import { NumberField } from './print/fields'
import { panelClass, primaryButtonClass, secondaryButtonClass } from './ui'

/** Lets the input pick a whole folder (non-standard but supported by all major browsers). */
const folderInputProps = { webkitdirectory: '', directory: '' } as Record<string, string>

function formatFileList(names: string[]): string {
  const shown = names.slice(0, 5).join(', ')
  return names.length > 5 ? `${shown} e altri ${names.length - 5}` : shown
}

interface NumberImagesSectionProps {
  numberImages: NumberImages
  onPreview: (value: number) => void
}

export function NumberImagesSection({ numberImages, onPreview }: NumberImagesSectionProps) {
  const { images, isLoading, progress, importFolder, clear, timeoutSeconds, setTimeoutSeconds } =
    numberImages
  const [result, setResult] = useState<ImportResult | null>(null)
  const confirm = useConfirm()
  const numbers = [...images.keys()]
  const isImporting = progress !== null

  const handleFolder = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (
      images.size > 0 &&
      !(await confirm({
        title: 'Sostituire le immagini?',
        message: 'Le immagini caricate finora verranno sostituite da quelle della nuova cartella.',
        confirmLabel: 'Sostituisci',
      }))
    ) {
      return
    }
    setResult(await importFolder(files))
  }

  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Rimuovere tutte le immagini?',
      message: 'I numeri estratti non mostreranno più nessuna immagine.',
      confirmLabel: 'Rimuovi',
      tone: 'danger',
    })
    if (confirmed) {
      await clear()
      setResult(null)
    }
  }

  return (
    <section className={`${panelClass} flex flex-col gap-4 p-5 presentation:hidden`}>
      <div>
        <h2 className="text-lg font-semibold">Immagini dei numeri</h2>
        <p className="text-sm text-muted">
          Scegli una cartella con immagini chiamate come il numero (es. <code>7.jpg</code>,{' '}
          <code>07.png</code>, <code>90.webp</code>): verranno mostrate a tutto schermo quando esce
          quel numero.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <label
          className={`${primaryButtonClass} ${isImporting ? 'pointer-events-none opacity-40' : ''}`}
        >
          {images.size > 0 ? 'Cambia cartella' : 'Scegli cartella'}
          <input
            type="file"
            multiple
            {...folderInputProps}
            disabled={isImporting}
            onChange={(event) => {
              const { files } = event.target
              void handleFolder(files).finally(() => (event.target.value = ''))
            }}
            className="hidden"
          />
        </label>
        {images.size > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isImporting}
            className={secondaryButtonClass}
          >
            Rimuovi immagini
          </button>
        )}
      </div>

      {isImporting && (
        <div>
          <p className="mb-1 text-sm text-muted">
            Caricamento immagini {progress.done} / {progress.total}…
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {result && !isImporting && (
        <div className="text-sm">
          {result.loaded === 0 && (
            <p className="font-medium text-danger">
              Nessuna immagine con il nome di un numero da 1 a 90 trovata nella cartella.
            </p>
          )}
          {result.duplicates.length > 0 && (
            <p className="text-muted">Doppioni ignorati: {formatFileList(result.duplicates)}.</p>
          )}
          {result.ignored.length > 0 && (
            <p className="text-muted">
              Immagini con nome non valido ignorate: {formatFileList(result.ignored)}.
            </p>
          )}
          {!result.isPersisted && (
            <p className="font-medium text-danger">
              Il browser non ha potuto salvare le immagini: resteranno disponibili fino alla
              chiusura della pagina.
            </p>
          )}
        </div>
      )}

      {!isLoading && !isImporting && (
        <div>
          <p className="mb-2 text-sm">
            {numbers.length === 0 ? (
              <span className="text-muted">Nessuna immagine caricata.</span>
            ) : (
              <>
                <span className="font-semibold">
                  {numbers.length} {numbers.length === 1 ? 'immagine' : 'immagini'}
                </span>{' '}
                <span className="text-muted">— clicca un numero per l’anteprima</span>
              </>
            )}
          </p>
          {numbers.length > 0 && (
            <ul className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {numbers.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => onPreview(value)}
                    className="min-w-9 cursor-pointer rounded-md bg-subtle px-2 py-1 text-center text-sm font-semibold tabular-nums transition-colors hover:bg-accent hover:text-on-accent"
                  >
                    {value}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="max-w-xs">
        <NumberField
          label="Chiudi automaticamente dopo"
          unit="secondi"
          value={timeoutSeconds}
          onChange={(value) => setTimeoutSeconds(Math.round(value))}
          min={0}
          max={600}
        />
        <p className="mt-1 text-xs text-muted">
          0 = resta aperta finché non clicchi o premi un tasto.
        </p>
      </div>
    </section>
  )
}

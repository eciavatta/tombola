import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { trackEvent } from '../../lib/analytics'
import { downloadPdf } from '../../lib/pdf'
import { buildPages, generateCards } from '../../lib/printLayout'
import {
  DEFAULT_PRINT_SETTINGS,
  exportSettings,
  importSettings,
  normalizeSettings,
  type CardTemplate,
  type PrintSettings,
} from '../../lib/printSettings'
import { normalizeImage, readImage } from '../../lib/image'
import { useConfirm } from '../confirm/context'
import { CardTab } from './CardTab'
import { primaryButtonClass, secondaryButtonClass } from '../ui'
import { GeneralTab } from './GeneralTab'
import { PagePreview } from './PagePreview'
import { StyleTab } from './StyleTab'
import { TitleTab } from './TitleTab'

const TABS = [
  { id: 'general', label: 'Generale' },
  { id: 'card', label: 'Cartella' },
  { id: 'title', label: 'Titolo' },
  { id: 'style', label: 'Stile' },
] as const

type TabId = (typeof TABS)[number]['id']

const MAX_TEMPLATE_SIDE = 3000
const PDF_FILE_NAME = 'cartelle-tombola.pdf'
const SETTINGS_FILE_NAME = 'tombola-impostazioni.json'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

interface PrintDialogProps {
  onClose: () => void
}

export function PrintDialog({ onClose }: PrintDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [settings, setSettings] = useLocalStorage<PrintSettings>(
    'tombola.printSettings',
    DEFAULT_PRINT_SETTINGS,
    normalizeSettings,
  )
  const [template, setTemplate, isTemplatePersisted] = useLocalStorage<CardTemplate | null>(
    'tombola.printTemplate',
    null,
    normalizeImage,
  )
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const confirm = useConfirm()

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const close = () => dialogRef.current?.close()

  const setSetting = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) =>
    setSettings((previous) => ({ ...previous, [key]: value }))

  // Sample cards for the preview; regenerated only when the page size changes.
  const sampleCards = useMemo(() => generateCards(settings.cardsPerPage), [settings.cardsPerPage])
  const previewPage = buildPages(sampleCards, settings, template)[0]

  const handleTemplateFile = async (file: File) => {
    try {
      setTemplate(await readImage(file, MAX_TEMPLATE_SIDE))
      setError(null)
    } catch {
      setError('Impossibile leggere l’immagine selezionata.')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const imported = await importSettings(file)
      setSettings(imported.settings)
      setTemplate(imported.template)
      setError(null)
    } catch {
      setError('Il file selezionato non contiene impostazioni valide.')
    }
  }

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Ripristinare le impostazioni predefinite?',
      message:
        'Tutte le impostazioni di stampa torneranno ai valori iniziali. Il template caricato resta invariato.',
      confirmLabel: 'Ripristina',
      tone: 'danger',
    })
    if (confirmed) {
      setSettings(DEFAULT_PRINT_SETTINGS)
    }
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const pages = buildPages(generateCards(settings.cardCount), settings, template)
      await downloadPdf(pages, PDF_FILE_NAME)
      trackEvent('download_cards', {
        card_count: settings.cardCount,
        cards_per_page: settings.cardsPerPage,
        has_template: template !== null,
      })
      close()
    } catch {
      setError('Errore durante la creazione del PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  const tabProps = { settings, setSetting }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto flex max-h-[calc(100dvh-2rem)] w-[min(72rem,calc(100%-2rem))] flex-col overflow-hidden animate-dialog-in rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/60 [&:not([open])]:hidden"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-semibold">Stampa cartelle</h2>
        <button
          type="button"
          onClick={close}
          className="cursor-pointer rounded-lg px-2 text-2xl leading-none text-muted hover:bg-subtle hover:text-fg"
          aria-label="Chiudi"
        >
          ×
        </button>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_1fr]">
        <div className="flex min-h-0 flex-col">
          <nav className="flex shrink-0 gap-1 border-b border-line px-4" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTab}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab.id === activeTab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div key={activeTab} className="min-h-0 flex-1 animate-fade-in overflow-y-auto p-6" role="tabpanel">
            {activeTab === 'general' && <GeneralTab {...tabProps} />}
            {activeTab === 'card' && (
              <CardTab
                {...tabProps}
                template={template}
                isTemplatePersisted={isTemplatePersisted}
                onTemplateFile={handleTemplateFile}
                onTemplateRemove={() => setTemplate(null)}
              />
            )}
            {activeTab === 'title' && <TitleTab {...tabProps} />}
            {activeTab === 'style' && <StyleTab {...tabProps} />}
          </div>
        </div>

        <div className="hidden min-h-0 overflow-y-auto border-l border-line bg-subtle p-6 md:block">
          <p className="mb-3 text-sm font-medium text-muted">
            Anteprima prima pagina (cartelle di esempio)
          </p>
          <PagePreview page={previewPage} />
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadBlob(exportSettings(settings, template), SETTINGS_FILE_NAME)}
            title="Salva impostazioni e template in un file"
            className={secondaryButtonClass}
          >
            Esporta
          </button>
          <label title="Carica impostazioni e template da un file" className={secondaryButtonClass}>
            Importa
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void handleImport(file)
              }}
              className="hidden"
            />
          </label>
          <button type="button" onClick={handleReset} className={secondaryButtonClass}>
            Ripristina predefiniti
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <button type="button" onClick={close} className={secondaryButtonClass}>
            Annulla
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className={primaryButtonClass}
          >
            {isGenerating ? 'Creazione PDF…' : 'Scarica PDF'}
          </button>
        </div>
      </footer>
    </dialog>
  )
}

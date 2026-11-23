import { cardAspectRatio, computeSlotLayout } from '../../lib/printLayout'
import type { CardTemplate, Insets } from '../../lib/printSettings'
import { secondaryButtonClass } from '../ui'
import { Hint, NumberField, Section } from './fields'
import type { SettingsTabProps } from './types'

const MM_PER_INCH = 25.4
const RECOMMENDED_DPI = 300
const MIN_DPI = 150
const MAX_INSET = 45

const INSET_FIELDS: { key: keyof Insets; label: string }[] = [
  { key: 'top', label: 'Sopra' },
  { key: 'bottom', label: 'Sotto' },
  { key: 'left', label: 'Sinistra' },
  { key: 'right', label: 'Destra' },
]

const formatMm = (value: number) => value.toFixed(0)
const pixelsFor = (mm: number, dpi: number) => Math.ceil((mm / MM_PER_INCH) * dpi)

interface CardTabProps extends SettingsTabProps {
  template: CardTemplate | null
  isTemplatePersisted: boolean
  onTemplateFile: (file: File) => void
  onTemplateRemove: () => void
}

export function CardTab({
  settings,
  setSetting,
  template,
  isTemplatePersisted,
  onTemplateFile,
  onTemplateRemove,
}: CardTabProps) {
  const { insets } = settings.grid
  const layout = computeSlotLayout(settings.cardsPerPage, cardAspectRatio(insets, template))
  const { cardWidth, cardHeight } = layout
  const printedDpi = template ? Math.round(template.width / (cardWidth / MM_PER_INCH)) : 0

  return (
    <div className="flex flex-col gap-6">
      <Section title="Template">
        <div className="flex flex-wrap gap-2">
          <label className={secondaryButtonClass}>
            {template ? 'Cambia immagine' : 'Carica immagine'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) onTemplateFile(file)
              }}
              className="hidden"
            />
          </label>
          {template && (
            <button type="button" onClick={onTemplateRemove} className={secondaryButtonClass}>
              Rimuovi
            </button>
          )}
        </div>

        <div className="rounded-lg bg-subtle p-4 text-sm text-fg">
          <p className="mb-1 font-semibold">Dimensioni dell’immagine</p>
          {template ? (
            <>
              <p>
                Ogni cartella sarà stampata a {formatMm(cardWidth)} × {formatMm(cardHeight)} mm.
                L’immagine caricata ({template.width} × {template.height} px) verrà stampata a circa{' '}
                <strong>{printedDpi} DPI</strong>.
              </p>
              {printedDpi < MIN_DPI && (
                <p className="mt-1 font-medium text-danger">
                  Risoluzione bassa: la stampa potrebbe risultare sgranata. Per una stampa nitida
                  usa un’immagine larga almeno {pixelsFor(cardWidth, RECOMMENDED_DPI)} px.
                </p>
              )}
              {template.height > template.width && (
                <p className="mt-1 font-medium text-danger">
                  L’immagine è più alta che larga: la cartella classica è orizzontale, la griglia
                  risulterà stretta.
                </p>
              )}
            </>
          ) : (
            <p>
              Con {settings.cardsPerPage} {settings.cardsPerPage === 1 ? 'cartella' : 'cartelle'} per
              pagina, una cartella misura circa {formatMm(cardWidth)} × {formatMm(cardHeight)} mm.
              Per una stampa nitida (300 DPI) usa un’immagine di almeno{' '}
              <strong>
                {pixelsFor(cardWidth, RECOMMENDED_DPI)} × {pixelsFor(cardHeight, RECOMMENDED_DPI)} px
              </strong>{' '}
              (proporzioni circa {(cardWidth / cardHeight).toFixed(1).replace('.', ',')}:1).
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            La cartella prende le proporzioni dell’immagine, che fa da sfondo all’intera cartella.
            Formati PNG, JPG o WebP; le immagini più grandi di 3000 px vengono ridotte.
          </p>
        </div>

        {template && !isTemplatePersisted && (
          <p className="text-sm font-medium text-danger">
            L’immagine è troppo grande per essere ricordata dal browser: resterà disponibile fino
            alla chiusura della pagina. Usa “Esporta” per salvarla insieme alle impostazioni.
          </p>
        )}
      </Section>

      <Section title="Margini della griglia (%)">
        <Hint>
          Distanza della griglia dai bordi della cartella, in percentuale. Lo spazio sopra o sotto
          ospita il titolo.
          {!template && ' Senza template, le proporzioni della cartella si adattano per avere celle quadrate.'}
        </Hint>
        <div className="grid grid-cols-2 gap-3">
          {INSET_FIELDS.map(({ key, label }) => (
            <NumberField
              key={key}
              label={label}
              value={insets[key]}
              onChange={(value) =>
                setSetting('grid', { ...settings.grid, insets: { ...insets, [key]: value } })
              }
              min={0}
              max={MAX_INSET}
              step={0.5}
            />
          ))}
        </div>
      </Section>
    </div>
  )
}

import type { FontFamily } from '../../lib/printSettings'
import { ChoiceField, ColorField, Hint, NumberField, Section } from './fields'
import type { SettingsTabProps } from './types'

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times' },
  { value: 'courier', label: 'Courier' },
]

export function StyleTab({ settings, setSetting }: SettingsTabProps) {
  const { numbers, grid, cells, card } = settings

  return (
    <div className="flex flex-col gap-6">
      <Section title="Carattere">
        <ChoiceField
          label="Font di numeri e titolo"
          value={settings.font}
          options={FONT_OPTIONS}
          onChange={(font) => setSetting('font', font)}
        />
      </Section>

      <Section title="Numeri">
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Colore"
            value={numbers.color}
            onChange={(color) => setSetting('numbers', { ...numbers, color })}
          />
          <NumberField
            label="Dimensione"
            unit="% cella"
            value={numbers.size}
            onChange={(size) => setSetting('numbers', { ...numbers, size })}
            min={10}
            max={100}
            step={5}
          />
        </div>
      </Section>

      <Section title="Griglia">
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Colore linee"
            value={grid.lineColor}
            onChange={(lineColor) => setSetting('grid', { ...grid, lineColor })}
          />
          <NumberField
            label="Spessore linee"
            unit="mm"
            value={grid.lineWidth}
            onChange={(lineWidth) => setSetting('grid', { ...grid, lineWidth })}
            min={0}
            max={3}
            step={0.05}
          />
        </div>
      </Section>

      <Section title="Sfondo celle">
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Celle con numero"
            value={cells.filledColor}
            onChange={(filledColor) => setSetting('cells', { ...cells, filledColor })}
          />
          <NumberField
            label="Opacità"
            unit="%"
            value={cells.filledOpacity}
            onChange={(filledOpacity) => setSetting('cells', { ...cells, filledOpacity })}
            min={0}
            max={100}
            step={5}
          />
          <ColorField
            label="Celle vuote"
            value={cells.emptyColor}
            onChange={(emptyColor) => setSetting('cells', { ...cells, emptyColor })}
          />
          <NumberField
            label="Opacità"
            unit="%"
            value={cells.emptyOpacity}
            onChange={(emptyOpacity) => setSetting('cells', { ...cells, emptyOpacity })}
            min={0}
            max={100}
            step={5}
          />
        </div>
        <Hint>Con un template, un’opacità bassa lascia intravedere l’immagine sotto le celle.</Hint>
      </Section>

      <Section title="Cartella senza template">
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Sfondo"
            value={card.backgroundColor}
            onChange={(backgroundColor) => setSetting('card', { ...card, backgroundColor })}
          />
          <ColorField
            label="Bordo"
            value={card.borderColor}
            onChange={(borderColor) => setSetting('card', { ...card, borderColor })}
          />
          <NumberField
            label="Spessore bordo"
            unit="mm"
            value={card.borderWidth}
            onChange={(borderWidth) => setSetting('card', { ...card, borderWidth })}
            min={0}
            max={5}
            step={0.1}
          />
        </div>
        <Hint>Con un template caricato, sfondo e bordo sono quelli dell’immagine.</Hint>
      </Section>
    </div>
  )
}

import { CARDS_PER_PAGE_OPTIONS, MAX_CARD_COUNT } from '../../lib/printSettings'
import { CARDS_PER_SERIES } from '../../lib/series'
import { inputClass } from '../ui'
import { CheckboxField, ColorField, Field, Hint, NumberField, Section } from './fields'
import type { SettingsTabProps } from './types'

export function GeneralTab({ settings, setSetting }: SettingsTabProps) {
  const { cardCount, cardsPerPage, cutLines } = settings
  const seriesCount = Math.ceil(cardCount / CARDS_PER_SERIES)
  const pageCount = Math.ceil(cardCount / cardsPerPage)

  return (
    <div className="flex flex-col gap-6">
      <Section title="Cartelle">
        <NumberField
          label="Numero di cartelle"
          value={cardCount}
          onChange={(value) => setSetting('cardCount', Math.round(value))}
          min={1}
          max={MAX_CARD_COUNT}
        />
        <Hint>
          {seriesCount} serie da 6 cartelle, che coprono tutti i 90
          numeri{cardCount % CARDS_PER_SERIES ? ' (l’ultima serie è incompleta)' : ''}.{' '}
          {pageCount} {pageCount === 1 ? 'pagina' : 'pagine'} A4.
        </Hint>

        <Field label="Cartelle per pagina">
          <select
            value={cardsPerPage}
            onChange={(event) => setSetting('cardsPerPage', Number(event.target.value))}
            className={inputClass}
          >
            {CARDS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Hint>L’orientamento della pagina viene scelto per avere le cartelle più grandi possibile.</Hint>
      </Section>

      <Section title="Linee di taglio">
        <CheckboxField
          label="Disegna linee di taglio tra le cartelle"
          checked={cutLines.enabled}
          onChange={(enabled) => setSetting('cutLines', { ...cutLines, enabled })}
        />
        {cutLines.enabled && (
          <ColorField
            label="Colore"
            value={cutLines.color}
            onChange={(color) => setSetting('cutLines', { ...cutLines, color })}
          />
        )}
      </Section>
    </div>
  )
}

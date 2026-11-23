import { TITLE_PLACEHOLDERS, type TextAlign, type TitlePosition } from '../../lib/printSettings'
import { inputClass } from '../ui'
import { ChoiceField, ColorField, Field, Hint, NumberField, Section } from './fields'
import type { SettingsTabProps } from './types'

const POSITION_OPTIONS: { value: TitlePosition; label: string }[] = [
  { value: 'top', label: 'Sopra la griglia' },
  { value: 'bottom', label: 'Sotto la griglia' },
]

const ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Sinistra' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Destra' },
]

export function TitleTab({ settings, setSetting }: SettingsTabProps) {
  const { title } = settings
  const update = (changes: Partial<typeof title>) => setSetting('title', { ...title, ...changes })

  return (
    <div className="flex flex-col gap-6">
      <Section title="Testo">
        <Field label="Titolo">
          <input
            type="text"
            value={title.text}
            onChange={(event) => update({ text: event.target.value })}
            placeholder="Lascia vuoto per non stampare il titolo"
            className={inputClass}
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {TITLE_PLACEHOLDERS.map(({ token, description }) => (
            <button
              key={token}
              type="button"
              onClick={() => update({ text: title.text + token })}
              title={`Aggiungi: ${description}`}
              className="cursor-pointer rounded-md bg-subtle px-2 py-1 font-mono text-xs text-fg hover:bg-accent hover:text-on-accent"
            >
              {token}
            </button>
          ))}
        </div>
        <Hint>
          Clicca un segnaposto per aggiungerlo:{' '}
          {TITLE_PLACEHOLDERS.map(({ token, description }) => `${token} ${description}`).join(', ')}.
          Sono supportati solo i caratteri dell’alfabeto latino (niente emoji).
        </Hint>
      </Section>

      <Section title="Posizione">
        <ChoiceField
          label="Posizione"
          value={title.position}
          options={POSITION_OPTIONS}
          onChange={(position) => update({ position })}
        />
        <ChoiceField
          label="Allineamento"
          value={title.align}
          options={ALIGN_OPTIONS}
          onChange={(align) => update({ align })}
        />
        <Hint>
          Il titolo è centrato nello spazio tra la griglia e il bordo della cartella (vedi i margini
          nella scheda Cartella). Gli spostamenti lo muovono da lì: valori positivi verso destra e
          verso il basso.
        </Hint>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Spostamento orizzontale"
            unit="mm"
            value={title.offsetX}
            onChange={(offsetX) => update({ offsetX })}
            min={-100}
            max={100}
            step={0.5}
          />
          <NumberField
            label="Spostamento verticale"
            unit="mm"
            value={title.offsetY}
            onChange={(offsetY) => update({ offsetY })}
            min={-100}
            max={100}
            step={0.5}
          />
        </div>
      </Section>

      <Section title="Aspetto">
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Dimensione"
            unit="pt"
            value={title.size}
            onChange={(size) => update({ size })}
            min={3}
            max={72}
            step={0.5}
          />
          <ColorField label="Colore" value={title.color} onChange={(color) => update({ color })} />
        </div>
      </Section>
    </div>
  )
}

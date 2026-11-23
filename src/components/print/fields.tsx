/** Small form controls shared by the print dialog tabs. */

import { useState, type ReactNode } from 'react'
import { inputClass, labelCapsClass } from '../ui'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={`mb-2 ${labelCapsClass}`}>{title}</legend>
      {children}
    </fieldset>
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted">{children}</p>
}

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-fg">
      {label}
      {children}
    </label>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

/** Numeric input that can be freely edited and is clamped to [min, max]. */
export function NumberField({ label, value, onChange, min, max, step = 1, unit }: NumberFieldProps) {
  // While focused, show what the user typed (it may be temporarily empty or out of range).
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <Field label={unit ? `${label} (${unit})` : label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        onFocus={() => setDraft(String(value))}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          setDraft(event.target.value)
          const parsed = Number(event.target.value)
          if (event.target.value.trim() !== '' && Number.isFinite(parsed)) {
            onChange(Math.min(max, Math.max(min, parsed)))
          }
        }}
        className={inputClass}
      />
    </Field>
  )
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm text-fg uppercase">{value}</span>
      </div>
    </Field>
  )
}

interface ChoiceFieldProps<T extends string> {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}

/** A row of toggle buttons for a small set of options. */
export function ChoiceField<T extends string>({ label, value, options, onChange }: ChoiceFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1 text-sm font-medium text-fg">
      {label}
      <div className="flex overflow-hidden rounded-lg border border-line bg-surface">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={option.value === value}
            className={`flex-1 cursor-pointer px-3 py-2 transition-colors not-first:border-l not-first:border-line ${
              option.value === value ? 'bg-accent text-on-accent' : 'text-fg hover:bg-subtle'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-accent"
      />
      {label}
    </label>
  )
}

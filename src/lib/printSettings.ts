/** Print settings: types, defaults, validation and import/export. */

import { normalizeImage, type LoadedImage } from './image'

export const CARDS_PER_PAGE_OPTIONS = [1, 2, 3, 4, 6, 8, 10, 12] as const
export const MAX_CARD_COUNT = 600
export const FONT_FAMILIES = ['helvetica', 'times', 'courier'] as const
export const TITLE_POSITIONS = ['top', 'bottom'] as const
export const TITLE_ALIGNMENTS = ['left', 'center', 'right'] as const

export type FontFamily = (typeof FONT_FAMILIES)[number]
export type TitlePosition = (typeof TITLE_POSITIONS)[number]
export type TextAlign = (typeof TITLE_ALIGNMENTS)[number]

/** Distances from the card edges, in percent of the card width/height. */
export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface TitleSettings {
  /** Free text; see `TITLE_PLACEHOLDERS`. Empty text hides the title. */
  text: string
  position: TitlePosition
  align: TextAlign
  /** Font size in pt. */
  size: number
  color: string
  /** Shift from the default position, in mm. */
  offsetX: number
  offsetY: number
}

export interface PrintSettings {
  cardCount: number
  cardsPerPage: number
  font: FontFamily
  cutLines: { enabled: boolean; color: string }
  /** Card look when no template is loaded. */
  card: { backgroundColor: string; borderColor: string; borderWidth: number }
  grid: { insets: Insets; lineColor: string; lineWidth: number }
  /** Number size is in percent of the cell size. */
  numbers: { color: string; size: number }
  /** Opacities are in percent. */
  cells: {
    filledColor: string
    filledOpacity: number
    emptyColor: string
    emptyOpacity: number
  }
  title: TitleSettings
}

/** Background image of every card. */
export type CardTemplate = LoadedImage

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  cardCount: 6,
  cardsPerPage: 6,
  font: 'helvetica',
  cutLines: { enabled: true, color: '#a8a29e' },
  card: { backgroundColor: '#ffffff', borderColor: '#991b1b', borderWidth: 0.5 },
  grid: {
    insets: { top: 16, right: 3, bottom: 4, left: 3 },
    lineColor: '#991b1b',
    lineWidth: 0.25,
  },
  numbers: { color: '#1c1917', size: 50 },
  cells: {
    filledColor: '#ffffff',
    filledOpacity: 100,
    emptyColor: '#fee2e2',
    emptyOpacity: 100,
  },
  title: {
    text: 'Serie {serie} · Cartella {cartella}',
    position: 'top',
    align: 'left',
    size: 8,
    color: '#991b1b',
    offsetX: 0,
    offsetY: 0,
  },
}

export const TITLE_PLACEHOLDERS = [
  { token: '{serie}', description: 'numero della serie' },
  { token: '{cartella}', description: 'cartella nella serie (1-6)' },
  { token: '{numero}', description: 'numero progressivo' },
  { token: '{totale}', description: 'totale cartelle' },
] as const

export interface TitleValues {
  series: number
  cardInSeries: number
  number: number
  total: number
}

export function formatTitle(text: string, values: TitleValues): string {
  return text
    .replaceAll('{serie}', String(values.series))
    .replaceAll('{cartella}', String(values.cardInSeries))
    .replaceAll('{numero}', String(values.number))
    .replaceAll('{totale}', String(values.total))
}

/**
 * Recursively takes from `value` every field that has the same type as in
 * `defaults`; anything missing or invalid falls back to the default.
 */
function mergeWithDefaults<T>(defaults: T, value: unknown): T {
  if (typeof defaults !== 'object' || defaults === null) {
    const isValid =
      typeof value === typeof defaults && (typeof value !== 'number' || Number.isFinite(value))
    return isValid ? (value as T) : defaults
  }
  if (typeof value !== 'object' || value === null) return defaults

  const result = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    result[key] = mergeWithDefaults(defaults[key], (value as Record<keyof T, unknown>)[key])
  }
  return result
}

function oneOf<T>(options: readonly T[], value: T, fallback: T): T {
  return options.includes(value) ? value : fallback
}

/** Validates settings coming from localStorage or an imported file. */
export function normalizeSettings(value: unknown): PrintSettings {
  const settings = mergeWithDefaults(DEFAULT_PRINT_SETTINGS, value)
  const defaults = DEFAULT_PRINT_SETTINGS
  return {
    ...settings,
    cardCount: Math.min(MAX_CARD_COUNT, Math.max(1, Math.round(settings.cardCount))),
    cardsPerPage: oneOf(CARDS_PER_PAGE_OPTIONS, settings.cardsPerPage as never, defaults.cardsPerPage),
    font: oneOf(FONT_FAMILIES, settings.font, defaults.font),
    title: {
      ...settings.title,
      position: oneOf(TITLE_POSITIONS, settings.title.position, defaults.title.position),
      align: oneOf(TITLE_ALIGNMENTS, settings.title.align, defaults.title.align),
    },
  }
}

interface SettingsFile {
  version: 1
  settings: PrintSettings
  template: CardTemplate | null
}

export function exportSettings(settings: PrintSettings, template: CardTemplate | null): Blob {
  const file: SettingsFile = { version: 1, settings, template }
  return new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
}

export async function importSettings(
  file: File,
): Promise<{ settings: PrintSettings; template: CardTemplate | null }> {
  const content = JSON.parse(await file.text()) as Partial<SettingsFile>
  if (typeof content !== 'object' || content === null || !('settings' in content)) {
    throw new Error('Invalid settings file')
  }
  return {
    settings: normalizeSettings(content.settings),
    template: normalizeImage(content.template),
  }
}

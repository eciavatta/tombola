import type { PrintSettings } from '../../lib/printSettings'

export interface SettingsTabProps {
  settings: PrintSettings
  setSetting: <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => void
}

import { createContext, useContext } from 'react'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` styles the confirm button as destructive and focuses "cancel" by default. */
  tone?: 'default' | 'danger'
}

/** Resolves to `true` if the user confirms, `false` if they cancel or dismiss the dialog. */
export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmContext = createContext<ConfirmFunction | null>(null)

/** Styled replacement for `window.confirm`; requires a `ConfirmProvider` above. */
export function useConfirm(): ConfirmFunction {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider')
  return confirm
}

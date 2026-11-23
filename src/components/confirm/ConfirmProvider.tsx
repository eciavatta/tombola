import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { dangerButtonClass, primaryButtonClass, secondaryButtonClass } from '../ui'
import { ConfirmContext, type ConfirmOptions } from './context'

interface PendingRequest {
  id: number
  options: ConfirmOptions
  resolve: (confirmed: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<PendingRequest | null>(null)
  const nextId = useRef(0)

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest((previous) => {
          // A new request supersedes a pending one, which counts as cancelled.
          previous?.resolve(false)
          return { id: nextId.current++, options, resolve }
        })
      }),
    [],
  )

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          key={request.id}
          options={request.options}
          onResult={(confirmed) => {
            request.resolve(confirmed)
            setRequest(null)
          }}
        />
      )}
    </ConfirmContext.Provider>
  )
}

interface ConfirmDialogProps {
  options: ConfirmOptions
  onResult: (confirmed: boolean) => void
}

function ConfirmDialog({ options, onResult }: ConfirmDialogProps) {
  const {
    title,
    message,
    confirmLabel = 'Conferma',
    cancelLabel = 'Annulla',
    tone = 'default',
  } = options
  const isDanger = tone === 'danger'
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Set by the buttons; Esc and clicks on the backdrop leave it false.
  const confirmed = useRef(false)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const close = (result: boolean) => {
    confirmed.current = result
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onResult(confirmed.current)}
      // The content fills the dialog, so a click on the dialog itself is on the backdrop.
      onClick={(event) => event.target === event.currentTarget && close(false)}
      aria-labelledby="confirm-title"
      aria-describedby={message ? 'confirm-message' : undefined}
      className="m-auto w-[min(28rem,calc(100%-2rem))] animate-dialog-in rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/60"
    >
      <div className="flex gap-4 p-6">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            isDanger ? 'bg-danger text-on-danger' : 'bg-accent text-on-accent'
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="size-5"
          >
            {isDanger ? (
              <path d="M12 8v5M12 16.5v.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            ) : (
              <path d="M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
            )}
          </svg>
        </div>
        <div className="min-w-0 pt-1.5">
          <h2 id="confirm-title" className="text-lg leading-tight font-semibold">
            {title}
          </h2>
          {message && (
            <p id="confirm-message" className="mt-2 text-sm text-muted">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line bg-subtle/50 px-6 py-4">
        <button
          type="button"
          autoFocus={isDanger}
          onClick={() => close(false)}
          className={secondaryButtonClass}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          autoFocus={!isDanger}
          onClick={() => close(true)}
          className={isDanger ? dangerButtonClass : primaryButtonClass}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_EVENT_NAME = 'Tombola'

const normalizeName = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : DEFAULT_EVENT_NAME

/** Name of the evening, editable in place. Also used as the page title. */
export function EventTitle() {
  const [name, setName] = useLocalStorage('tombola.eventName', DEFAULT_EVENT_NAME, normalizeName)
  const [draft, setDraft] = useState<string | null>(null)

  useEffect(() => {
    // Keep the SEO title of index.html unless the evening has its own name.
    if (name === DEFAULT_EVENT_NAME) return
    const seoTitle = document.title
    document.title = `${name} · Tombola`
    return () => {
      document.title = seoTitle
    }
  }, [name])

  const save = () => {
    if (draft === null) return
    setName(normalizeName(draft.trim()))
    setDraft(null)
  }

  if (draft !== null) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save()
          if (event.key === 'Escape') setDraft(null)
        }}
        maxLength={80}
        aria-label="Nome della serata"
        placeholder={DEFAULT_EVENT_NAME}
        className="w-full min-w-0 rounded-lg border border-line bg-surface px-2 py-0.5 text-2xl font-bold text-fg focus:outline-2 focus:outline-accent sm:text-3xl"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setDraft(name)}
      title="Modifica il nome della serata"
      className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-0.5 text-left hover:bg-subtle presentation:pointer-events-none"
    >
      <h1 className="truncate text-2xl font-bold text-fg sm:text-3xl">{name}</h1>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="size-4 shrink-0 text-muted opacity-0 presentation:hidden transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <path d="M13.6 2.6a2 2 0 0 1 2.8 2.8l-9.5 9.5-3.9 1.1 1.1-3.9 9.5-9.5Z" />
      </svg>
    </button>
  )
}

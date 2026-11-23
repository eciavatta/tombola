import { useCallback, useRef, useState } from 'react'

type SetValue<T> = (next: T | ((previous: T) => T)) => void

function readStored<T>(key: string, initialValue: T, normalize?: (stored: unknown) => T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return initialValue
    const parsed: unknown = JSON.parse(stored)
    return normalize ? normalize(parsed) : (parsed as T)
  } catch {
    return initialValue
  }
}

/** Returns `false` if the value could not be saved (e.g. storage quota exceeded). */
function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Drop the stale value, so a reload does not bring back old data.
    localStorage.removeItem(key)
    return false
  }
}

/**
 * Like `useState`, but the value is persisted in localStorage.
 * `normalize` validates the stored value (e.g. data saved by an older version).
 * The third returned value is `false` when the value could not be saved:
 * it stays available in memory only.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  normalize?: (stored: unknown) => T,
) {
  const [value, setValue] = useState(() => readStored(key, initialValue, normalize))
  const [isPersisted, setIsPersisted] = useState(true)
  // Latest value, so consecutive functional updates in the same event see each other.
  const latestValue = useRef(value)

  const update: SetValue<T> = useCallback(
    (next) => {
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T)(latestValue.current) : next
      latestValue.current = resolved
      setValue(resolved)
      setIsPersisted(writeStored(key, resolved))
    },
    [key],
  )

  return [value, update, isPersisted] as const
}

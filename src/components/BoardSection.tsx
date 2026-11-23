import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import { TOTAL_NUMBERS } from '../lib/series'
import { Board } from './Board'
import { useConfirm } from './confirm/context'
import { EventLogo } from './EventLogo'
import { labelCapsClass, panelClass, primaryButtonClass, secondaryButtonClass } from './ui'

/** Before a draw is committed, random numbers flash for a short time. */
const ROLL_DURATION_MS = 700
const ROLL_STEP_MS = 60

interface BoardSectionProps {
  drawnNumbers: number[]
  onDrawnNumbersChange: (drawnNumbers: number[]) => void
}

export function BoardSection({ drawnNumbers, onDrawnNumbersChange }: BoardSectionProps) {
  const lastNumber = drawnNumbers.at(-1)
  const isComplete = drawnNumbers.length === TOTAL_NUMBERS
  // Previous states of the board, used to undo draws, clicks and resets.
  const [history, setHistory] = useState<number[][]>([])
  // Number shown while a draw is "rolling"; the board is locked meanwhile.
  const [rollingNumber, setRollingNumber] = useState<number | null>(null)
  const rollTimer = useRef<number | undefined>(undefined)
  const isRolling = rollingNumber !== null
  const confirm = useConfirm()

  useEffect(() => () => window.clearInterval(rollTimer.current), [])

  const updateDrawnNumbers = (next: number[]) => {
    setHistory((previous) => [...previous, drawnNumbers])
    onDrawnNumbersChange(next)
  }

  const undo = () => {
    if (history.length > 0) {
      onDrawnNumbersChange(history[history.length - 1])
      setHistory((previous) => previous.slice(0, -1))
    } else {
      // History is not persisted: after a reload, undo the last marked number.
      onDrawnNumbersChange(drawnNumbers.slice(0, -1))
    }
  }

  const canUndo = history.length > 0 || drawnNumbers.length > 0

  const drawNumber = () => {
    const drawn = new Set(drawnNumbers)
    const remaining = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter(
      (value) => !drawn.has(value),
    )
    if (remaining.length === 0) return
    const pickRandom = () => remaining[Math.floor(Math.random() * remaining.length)]
    const value = pickRandom()

    if (remaining.length === 1 || prefersReducedMotion()) {
      updateDrawnNumbers([...drawnNumbers, value])
      return
    }

    const startedAt = performance.now()
    setRollingNumber(pickRandom())
    rollTimer.current = window.setInterval(() => {
      if (performance.now() - startedAt < ROLL_DURATION_MS) {
        setRollingNumber(pickRandom())
        return
      }
      window.clearInterval(rollTimer.current)
      setRollingNumber(null)
      updateDrawnNumbers([...drawnNumbers, value])
    }, ROLL_STEP_MS)
  }

  const toggleNumber = (value: number) => {
    updateDrawnNumbers(
      drawnNumbers.includes(value)
        ? drawnNumbers.filter((n) => n !== value)
        : [...drawnNumbers, value],
    )
  }

  const resetBoard = async () => {
    if (drawnNumbers.length === 0) return
    const confirmed = await confirm({
      title: 'Iniziare una nuova partita?',
      message: 'Il tabellone verrà azzerato. Potrai comunque recuperarlo con “Annulla mossa”.',
      confirmLabel: 'Nuova partita',
      tone: 'danger',
    })
    if (confirmed) {
      updateDrawnNumbers([])
    }
  }

  return (
    <section className="stage:flex stage:min-h-0 stage:flex-1 stage:flex-col">
      <div className="flex flex-col gap-6 lg:flex-row stage:min-h-0 stage:flex-1">
        {/* On stage, the board takes all the height left and stays centered. */}
        <div className="min-w-0 flex-1 stage:flex stage:min-h-0 stage:items-center stage:justify-center stage:[container-type:size]">
          <Board drawnNumbers={drawnNumbers} onToggle={toggleNumber} disabled={isRolling} />
        </div>

        <aside className="flex flex-col gap-4 lg:w-80 stage:w-96 stage:overflow-y-auto">
          <EventLogo />

          <div className={`${panelClass} p-5 text-center`}>
            <p className={labelCapsClass}>Ultimo estratto</p>
            <div aria-live="polite" aria-busy={isRolling}>
              <p
                // A new key restarts the entrance animation for every new number.
                key={isRolling ? 'rolling' : lastNumber}
                className={`my-1 text-8xl leading-tight font-bold tabular-nums stage:text-[min(10rem,17vh)] ${
                  isRolling
                    ? 'text-muted'
                    : lastNumber === undefined
                      ? 'text-line'
                      : 'animate-number-in text-highlight'
                }`}
              >
                {rollingNumber ?? lastNumber ?? '–'}
              </p>
            </div>
            <div className="mx-auto h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${(drawnNumbers.length / TOTAL_NUMBERS) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-fg">{drawnNumbers.length}</span> / {TOTAL_NUMBERS}{' '}
              estratti
            </p>
          </div>

          <button
            type="button"
            onClick={drawNumber}
            disabled={isComplete || isRolling}
            className={`${primaryButtonClass} py-3 text-lg`}
          >
            {isComplete ? 'Numeri finiti' : 'Estrai numero'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo || isRolling}
              title="Annulla l'ultima estrazione o l'ultimo click sul tabellone"
              className={`${secondaryButtonClass} px-2 text-sm`}
            >
              Annulla mossa
            </button>
            <button
              type="button"
              onClick={resetBoard}
              disabled={drawnNumbers.length === 0 || isRolling}
              className={`${secondaryButtonClass} px-2 text-sm`}
            >
              Nuova partita
            </button>
          </div>

          <div className={`${panelClass} p-4 stage:flex stage:min-h-0 stage:flex-1 stage:flex-col`}>
            <p className={`mb-3 ${labelCapsClass}`}>Ordine di estrazione</p>
            {drawnNumbers.length === 0 ? (
              <p className="text-sm text-muted">Nessun numero estratto.</p>
            ) : (
              <ol className="flex max-h-48 flex-wrap content-start gap-1.5 overflow-y-auto stage:max-h-none stage:min-h-0 stage:flex-1">
                {[...drawnNumbers].reverse().map((value) => (
                  <li
                    key={value}
                    className="min-w-9 animate-slide-in rounded-md bg-subtle px-2 py-1 text-center text-sm font-semibold tabular-nums"
                  >
                    {value}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

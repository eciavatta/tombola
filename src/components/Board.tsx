const BOARD_COLUMNS = 10
const BLOCK_ROWS = 3
const BLOCK_COLUMNS = 5
const BLOCKS_PER_ROW = BOARD_COLUMNS / BLOCK_COLUMNS
const BLOCK_COUNT = 6

interface BoardProps {
  drawnNumbers: number[]
  onToggle: (value: number) => void
  disabled?: boolean
}

/** Numbers of a 3x5 block, in reading order. */
function blockNumbers(block: number): number[] {
  const firstRow = Math.floor(block / BLOCKS_PER_ROW) * BLOCK_ROWS
  const firstColumn = (block % BLOCKS_PER_ROW) * BLOCK_COLUMNS
  return Array.from({ length: BLOCK_ROWS * BLOCK_COLUMNS }, (_, i) => {
    const row = firstRow + Math.floor(i / BLOCK_COLUMNS)
    const column = firstColumn + (i % BLOCK_COLUMNS)
    return row * BOARD_COLUMNS + column + 1
  })
}

/**
 * The 90-number board: 9 rows of 10 numbers, visually split into
 * the six classic 3x5 blocks.
 */
export function Board({ drawnNumbers, onToggle, disabled = false }: BoardProps) {
  const drawn = new Set(drawnNumbers)
  const lastNumber = drawnNumbers.at(-1)

  return (
    // On stage the board is as large as its container allows, keeping the 10:9 ratio of
    // its cells, and becomes a size container itself, so the numbers scale with it.
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-surface p-2 sm:gap-5 sm:p-4 stage:aspect-[10/9] stage:w-[min(100cqw,calc(100cqh*10/9))] stage:grid-rows-3 stage:[container-type:size]">
      {Array.from({ length: BLOCK_COUNT }, (_, block) => (
        <div key={block} className="grid grid-cols-5 gap-1 sm:gap-1.5 stage:grid-rows-3 stage:gap-[0.8cqh]">
          {blockNumbers(block).map((value) => {
            const isDrawn = drawn.has(value)
            const isLast = value === lastNumber

            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                disabled={disabled}
                aria-pressed={isDrawn}
                title={isDrawn ? `Togli il ${value}` : `Segna il ${value}`}
                className={`aspect-square cursor-pointer rounded-md border text-sm font-semibold tabular-nums transition-[color,background-color,border-color,scale] select-none active:scale-90 disabled:cursor-wait disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-xl stage:aspect-auto stage:rounded-lg stage:text-[min(4.6cqh,4.2cqw)] ${
                  isLast
                    ? 'animate-pop border-highlight bg-highlight text-on-highlight'
                    : isDrawn
                      ? 'animate-pop border-accent bg-accent text-on-accent hover:bg-accent-hover'
                      : 'border-cell-line bg-cell text-on-cell hover:border-accent hover:text-fg'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

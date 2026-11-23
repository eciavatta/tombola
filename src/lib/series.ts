/**
 * Generation of classic Italian tombola cards ("cartelle").
 *
 * Rules:
 * - each card is a 3x9 grid with 15 numbers, 5 per row;
 * - column 0 holds 1-9, columns 1-7 hold their decade (10-19, ..., 70-79),
 *   column 8 holds 80-90;
 * - every column of a card holds 1 to 3 numbers, sorted top to bottom;
 * - a series is made of 6 cards that together contain all 90 numbers
 *   exactly once.
 */

export const ROWS = 3
export const COLUMNS = 9
export const NUMBERS_PER_ROW = 5
export const NUMBERS_PER_CARD = ROWS * NUMBERS_PER_ROW
export const CARDS_PER_SERIES = 6
export const TOTAL_NUMBERS = 90

/** A 3x9 grid; `null` marks an empty cell. */
export type CardGrid = (number | null)[][]

export interface Series {
  id: string
  cards: CardGrid[]
}

const MAX_ATTEMPTS = 1000

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive)
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Returns the numbers belonging to a given column. */
export function columnNumbers(column: number): number[] {
  const start = column === 0 ? 1 : column * 10
  const end = column === COLUMNS - 1 ? TOTAL_NUMBERS : column * 10 + 9
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Decides how many numbers each card gets in each column.
 * Returns `counts[card][column]`, or `null` if the random greedy
 * distribution got stuck (the caller retries).
 */
function distributeColumnCounts(): number[][] | null {
  // Every card starts with one number per column.
  const counts = Array.from({ length: CARDS_PER_SERIES }, () => Array<number>(COLUMNS).fill(1))
  const missing = Array<number>(CARDS_PER_SERIES).fill(NUMBERS_PER_CARD - COLUMNS)

  // Each remaining number of each column is an "extra" to hand out.
  const extras: number[] = []
  for (let column = 0; column < COLUMNS; column++) {
    const extraCount = columnNumbers(column).length - CARDS_PER_SERIES
    for (let i = 0; i < extraCount; i++) extras.push(column)
  }

  for (const column of shuffle(extras)) {
    const eligible = counts
      .map((_, card) => card)
      .filter((card) => missing[card] > 0 && counts[card][column] < ROWS)
    if (eligible.length === 0) return null

    // Prefer the cards that still miss the most numbers.
    const maxMissing = Math.max(...eligible.map((card) => missing[card]))
    const candidates = eligible.filter((card) => missing[card] === maxMissing)
    const chosen = candidates[randomInt(candidates.length)]

    counts[chosen][column]++
    missing[chosen]--
  }

  return counts
}

const ROW_OPTIONS: Record<number, number[][]> = {
  1: [[0], [1], [2]],
  2: [
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  3: [[0, 1, 2]],
}

/**
 * Chooses which rows each column uses so that every row ends up with
 * exactly 5 numbers. Returns `rowsByColumn[column]` (sorted row indexes).
 */
function arrangeRows(columnCounts: number[]): number[][] | null {
  const rowFill = Array<number>(ROWS).fill(0)
  const rowsByColumn: number[][] = []

  const place = (column: number): boolean => {
    if (column === COLUMNS) return rowFill.every((fill) => fill === NUMBERS_PER_ROW)

    const remainingColumns = COLUMNS - column
    for (const rows of shuffle(ROW_OPTIONS[columnCounts[column]])) {
      rows.forEach((row) => rowFill[row]++)
      rowsByColumn[column] = rows

      // Each row can receive at most one number per remaining column.
      const feasible = rowFill.every(
        (fill) => fill <= NUMBERS_PER_ROW && fill + remainingColumns - 1 >= NUMBERS_PER_ROW,
      )
      if (feasible && place(column + 1)) return true

      rows.forEach((row) => rowFill[row]--)
    }
    return false
  }

  return place(0) ? rowsByColumn : null
}

/** Generates a series of 6 cards covering all 90 numbers. */
export function generateSeries(): Series {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const counts = distributeColumnCounts()
    if (!counts) continue

    const layouts = counts.map(arrangeRows)
    if (layouts.some((layout) => layout === null)) continue

    const cards: CardGrid[] = counts.map(() =>
      Array.from({ length: ROWS }, () => Array<number | null>(COLUMNS).fill(null)),
    )

    for (let column = 0; column < COLUMNS; column++) {
      const pool = shuffle(columnNumbers(column))
      counts.forEach((cardCounts, card) => {
        const numbers = pool.splice(0, cardCounts[column]).sort((a, b) => a - b)
        const rows = layouts[card]![column]
        rows.forEach((row, i) => {
          cards[card][row][column] = numbers[i]
        })
      })
    }

    return { id: crypto.randomUUID(), cards }
  }

  throw new Error('Unable to generate a valid series')
}

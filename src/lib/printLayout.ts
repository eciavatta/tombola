/**
 * Page layout for printed cards.
 *
 * Every page is described as a list of plain drawing primitives (in mm),
 * so the same output can be rendered both to the PDF and to the SVG preview.
 */

import {
  formatTitle,
  type CardTemplate,
  type FontFamily,
  type Insets,
  type PrintSettings,
  type TextAlign,
} from './printSettings'
import { CARDS_PER_SERIES, COLUMNS, ROWS, generateSeries, type CardGrid } from './series'

export const MM_PER_POINT = 25.4 / 72

export interface GeneratedCard {
  grid: CardGrid
  series: number
  cardInSeries: number
  /** Progressive number, starting from 1. */
  number: number
}

export type Shape =
  | {
      type: 'rect'
      x: number
      y: number
      width: number
      height: number
      fill?: string
      /** 0-1 */
      fillOpacity?: number
      stroke?: string
      lineWidth?: number
      dashed?: boolean
    }
  | {
      type: 'text'
      x: number
      y: number
      text: string
      /** Font size in mm. */
      size: number
      color: string
      font: FontFamily
      align: TextAlign
    }
  | { type: 'image'; x: number; y: number; width: number; height: number; dataUrl: string }

export interface Page {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  shapes: Shape[]
}

const A4 = { width: 210, height: 297 }
const PAGE_MARGIN = 10
const CARD_GAP = 6

interface SlotLayout {
  orientation: Page['orientation']
  pageWidth: number
  pageHeight: number
  cardWidth: number
  cardHeight: number
  slots: { x: number; y: number }[]
}

/**
 * Height/width ratio of the card: the template's one, or (without template)
 * the one that makes the grid cells square.
 */
export function cardAspectRatio(insets: Insets, template: CardTemplate | null): number {
  if (template) return template.height / template.width
  const gridWidthRatio = 1 - (insets.left + insets.right) / 100
  const gridHeightRatio = 1 - (insets.top + insets.bottom) / 100
  return (gridWidthRatio / COLUMNS) * (ROWS / gridHeightRatio)
}

/**
 * Finds the page orientation and the grid of slots that make the cards
 * as large as possible.
 */
export function computeSlotLayout(cardsPerPage: number, aspectRatio: number): SlotLayout {
  let best: SlotLayout | null = null

  for (const orientation of ['portrait', 'landscape'] as const) {
    const pageWidth = orientation === 'portrait' ? A4.width : A4.height
    const pageHeight = orientation === 'portrait' ? A4.height : A4.width

    for (let columns = 1; columns <= cardsPerPage; columns++) {
      const rows = Math.ceil(cardsPerPage / columns)
      // Skip grids that would leave a whole row empty.
      if (columns * rows - cardsPerPage >= columns) continue

      const availableWidth = (pageWidth - 2 * PAGE_MARGIN - (columns - 1) * CARD_GAP) / columns
      const availableHeight = (pageHeight - 2 * PAGE_MARGIN - (rows - 1) * CARD_GAP) / rows
      const cardWidth = Math.min(availableWidth, availableHeight / aspectRatio)
      if (best && cardWidth <= best.cardWidth) continue

      const cardHeight = cardWidth * aspectRatio
      const gridWidth = columns * cardWidth + (columns - 1) * CARD_GAP
      const gridHeight = rows * cardHeight + (rows - 1) * CARD_GAP
      const originX = (pageWidth - gridWidth) / 2
      const originY = (pageHeight - gridHeight) / 2

      best = {
        orientation,
        pageWidth,
        pageHeight,
        cardWidth,
        cardHeight,
        slots: Array.from({ length: cardsPerPage }, (_, i) => ({
          x: originX + (i % columns) * (cardWidth + CARD_GAP),
          y: originY + Math.floor(i / columns) * (cardHeight + CARD_GAP),
        })),
      }
    }
  }

  return best!
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

function cardShapes(
  card: GeneratedCard,
  box: Box,
  settings: PrintSettings,
  template: CardTemplate | null,
): Shape[] {
  const { x, y, width, height } = box
  const { grid, numbers, cells, title } = settings
  const shapes: Shape[] = []

  if (template) {
    shapes.push({ type: 'image', x, y, width, height, dataUrl: template.dataUrl })
  } else {
    const { backgroundColor, borderColor, borderWidth } = settings.card
    shapes.push({
      type: 'rect',
      x,
      y,
      width,
      height,
      fill: backgroundColor,
      stroke: borderWidth > 0 ? borderColor : undefined,
      lineWidth: borderWidth,
    })
  }

  const { insets } = grid
  const gridX = x + (width * insets.left) / 100
  const gridY = y + (height * insets.top) / 100
  const gridWidth = width * (1 - (insets.left + insets.right) / 100)
  const gridHeight = height * (1 - (insets.top + insets.bottom) / 100)
  const cellWidth = gridWidth / COLUMNS
  const cellHeight = gridHeight / ROWS

  card.grid.forEach((row, rowIndex) =>
    row.forEach((value, columnIndex) => {
      const cellX = gridX + columnIndex * cellWidth
      const cellY = gridY + rowIndex * cellHeight
      const isEmpty = value === null
      const opacity = (isEmpty ? cells.emptyOpacity : cells.filledOpacity) / 100

      if (opacity > 0 || grid.lineWidth > 0) {
        shapes.push({
          type: 'rect',
          x: cellX,
          y: cellY,
          width: cellWidth,
          height: cellHeight,
          fill: opacity > 0 ? (isEmpty ? cells.emptyColor : cells.filledColor) : undefined,
          fillOpacity: opacity,
          stroke: grid.lineWidth > 0 ? grid.lineColor : undefined,
          lineWidth: grid.lineWidth,
        })
      }

      if (!isEmpty) {
        shapes.push({
          type: 'text',
          x: cellX + cellWidth / 2,
          y: cellY + cellHeight / 2,
          text: String(value),
          size: (Math.min(cellWidth, cellHeight) * numbers.size) / 100,
          color: numbers.color,
          font: settings.font,
          align: 'center',
        })
      }
    }),
  )

  const titleText = formatTitle(title.text, {
    series: card.series,
    cardInSeries: card.cardInSeries,
    number: card.number,
    total: settings.cardCount,
  }).trim()

  if (titleText) {
    // The title is centered in the band above or below the grid.
    const titleY =
      title.position === 'top'
        ? y + (gridY - y) / 2
        : gridY + gridHeight + (y + height - gridY - gridHeight) / 2
    const titleX = { left: gridX, center: gridX + gridWidth / 2, right: gridX + gridWidth }[title.align]

    shapes.push({
      type: 'text',
      x: titleX + title.offsetX,
      y: titleY + title.offsetY,
      text: titleText,
      size: title.size * MM_PER_POINT,
      color: title.color,
      font: settings.font,
      align: title.align,
    })
  }

  return shapes
}

/** Lays out the given cards into pages. */
export function buildPages(
  cards: GeneratedCard[],
  settings: PrintSettings,
  template: CardTemplate | null,
): Page[] {
  const aspectRatio = cardAspectRatio(settings.grid.insets, template)
  const layout = computeSlotLayout(settings.cardsPerPage, aspectRatio)
  const { cardWidth, cardHeight } = layout
  const pages: Page[] = []

  for (let start = 0; start < cards.length; start += settings.cardsPerPage) {
    const pageCards = cards.slice(start, start + settings.cardsPerPage)
    const shapes: Shape[] = []

    if (settings.cutLines.enabled) {
      // A dashed frame around each card, halfway into the gap: adjacent frames overlap.
      pageCards.forEach((_, i) => {
        const { x, y } = layout.slots[i]
        shapes.push({
          type: 'rect',
          x: x - CARD_GAP / 2,
          y: y - CARD_GAP / 2,
          width: cardWidth + CARD_GAP,
          height: cardHeight + CARD_GAP,
          stroke: settings.cutLines.color,
          lineWidth: 0.2,
          dashed: true,
        })
      })
    }

    pageCards.forEach((card, i) => {
      const box = { ...layout.slots[i], width: cardWidth, height: cardHeight }
      shapes.push(...cardShapes(card, box, settings, template))
    })

    pages.push({
      width: layout.pageWidth,
      height: layout.pageHeight,
      orientation: layout.orientation,
      shapes,
    })
  }

  return pages
}

/**
 * Generates `count` cards as complete series of 6; only the last series
 * may be partial.
 */
export function generateCards(count: number): GeneratedCard[] {
  const seriesCount = Math.ceil(count / CARDS_PER_SERIES)
  return Array.from({ length: seriesCount }, (_, seriesIndex) =>
    generateSeries().cards.map((grid, cardIndex) => ({
      grid,
      series: seriesIndex + 1,
      cardInSeries: cardIndex + 1,
      number: seriesIndex * CARDS_PER_SERIES + cardIndex + 1,
    })),
  )
    .flat()
    .slice(0, count)
}

import type { Page } from '../../lib/printLayout'
import type { FontFamily, TextAlign } from '../../lib/printSettings'

const FONT_STACKS: Record<FontFamily, string> = {
  helvetica: 'Helvetica, Arial, sans-serif',
  times: '"Times New Roman", Times, serif',
  courier: '"Courier New", Courier, monospace',
}

const TEXT_ANCHORS: Record<TextAlign, 'start' | 'middle' | 'end'> = {
  left: 'start',
  center: 'middle',
  right: 'end',
}

/** SVG rendering of a page, using the same shapes drawn in the PDF. */
export function PagePreview({ page }: { page: Page }) {
  return (
    <svg
      viewBox={`0 0 ${page.width} ${page.height}`}
      className="h-auto w-full rounded-sm bg-white ring-1 ring-line"
      style={{ aspectRatio: `${page.width} / ${page.height}` }}
      fontWeight="bold"
    >
      {page.shapes.map((shape, i) => {
        switch (shape.type) {
          case 'image':
            return (
              <image
                key={i}
                href={shape.dataUrl}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                preserveAspectRatio="none"
              />
            )
          case 'rect':
            return (
              <rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={shape.fill ?? 'none'}
                fillOpacity={shape.fillOpacity}
                stroke={shape.stroke ?? 'none'}
                strokeWidth={shape.lineWidth}
                strokeDasharray={shape.dashed ? '1.5 1' : undefined}
              />
            )
          case 'text':
            return (
              <text
                key={i}
                x={shape.x}
                y={shape.y}
                fontSize={shape.size}
                fontFamily={FONT_STACKS[shape.font]}
                fill={shape.color}
                textAnchor={TEXT_ANCHORS[shape.align]}
                dominantBaseline="central"
                style={{ whiteSpace: 'pre' }}
              >
                {shape.text}
              </text>
            )
        }
      })}
    </svg>
  )
}

import { MM_PER_POINT, type Page } from './printLayout'

const TEMPLATE_IMAGE_ALIAS = 'card-template'

function imageFormat(dataUrl: string): string {
  return dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
}

/** Renders the pages to a PDF and triggers its download. */
export async function downloadPdf(pages: Page[], fileName: string): Promise<void> {
  // Loaded on demand: jsPDF is only needed when printing.
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: pages[0].orientation,
    compress: true,
  })

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) doc.addPage('a4', page.orientation)

    for (const shape of page.shapes) {
      switch (shape.type) {
        case 'image':
          // The alias makes jsPDF embed the template once and reuse it.
          doc.addImage(
            shape.dataUrl,
            imageFormat(shape.dataUrl),
            shape.x,
            shape.y,
            shape.width,
            shape.height,
            TEMPLATE_IMAGE_ALIAS,
          )
          break

        case 'rect': {
          if (!shape.fill && !shape.stroke) break
          const style = shape.fill && shape.stroke ? 'FD' : shape.fill ? 'F' : 'S'
          if (shape.fill) doc.setFillColor(shape.fill)
          if (shape.stroke) doc.setDrawColor(shape.stroke)
          doc.setLineWidth(shape.lineWidth ?? 0.2)
          doc.setLineDashPattern(shape.dashed ? [1.5, 1] : [], 0)
          const opacity = shape.fillOpacity ?? 1
          if (opacity < 1) doc.setGState(doc.GState({ opacity, 'stroke-opacity': 1 }))
          doc.rect(shape.x, shape.y, shape.width, shape.height, style)
          if (opacity < 1) doc.setGState(doc.GState({ opacity: 1 }))
          break
        }

        case 'text':
          doc.setFont(shape.font, 'bold')
          doc.setFontSize(shape.size / MM_PER_POINT)
          doc.setTextColor(shape.color)
          doc.text(shape.text, shape.x, shape.y, { align: shape.align, baseline: 'middle' })
          break
      }
    }
  })

  doc.save(fileName)
}

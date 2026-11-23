export interface LoadedImage {
  dataUrl: string
  width: number
  height: number
}

const JPEG_QUALITY = 0.9

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Invalid image'))
    image.src = src
  })
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = context.getImageData(0, 0, width, height)
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true
  }
  return false
}

/**
 * Draws an image file on a canvas, scaled down so that its longest side is
 * at most `maxSide` px. Returns the canvas and the best output format:
 * PNG only when the image has transparent areas, JPEG otherwise.
 */
async function drawScaled(
  file: Blob,
  maxSide: number,
): Promise<{ canvas: HTMLCanvasElement; type: 'image/png' | 'image/jpeg' }> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })!
    context.drawImage(image, 0, 0, width, height)

    const type = hasTransparency(context, width, height) ? 'image/png' : 'image/jpeg'
    return { canvas, type }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/** Reads an uploaded image, scaled down to `maxSide`, as a data URL (for localStorage). */
export async function readImage(file: Blob, maxSide: number): Promise<LoadedImage> {
  const { canvas, type } = await drawScaled(file, maxSide)
  return {
    dataUrl: canvas.toDataURL(type, JPEG_QUALITY),
    width: canvas.width,
    height: canvas.height,
  }
}

/** Reads an uploaded image, scaled down to `maxSide`, as a Blob (for IndexedDB). */
export async function readImageBlob(file: Blob, maxSide: number): Promise<Blob> {
  const { canvas, type } = await drawScaled(file, maxSide)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
      type,
      JPEG_QUALITY,
    )
  })
}

/** Validates an image coming from localStorage or an imported file. */
export function normalizeImage(value: unknown): LoadedImage | null {
  if (typeof value !== 'object' || value === null) return null
  const { dataUrl, width, height } = value as Record<string, unknown>
  const isValid =
    typeof dataUrl === 'string' &&
    dataUrl.startsWith('data:image/') &&
    typeof width === 'number' &&
    typeof height === 'number' &&
    width > 0 &&
    height > 0
  return isValid ? { dataUrl, width, height } : null
}

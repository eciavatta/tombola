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
 * Reads an uploaded image, scales it down so that its longest side is at
 * most `maxSide` px (keeps PDFs and localStorage small) and encodes it as a
 * data URL: PNG only when it has transparent areas, JPEG otherwise.
 */
export async function readImage(file: File, maxSide: number): Promise<LoadedImage> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.round(image.naturalWidth * scale)
    const height = Math.round(image.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })!
    context.drawImage(image, 0, 0, width, height)

    const dataUrl = hasTransparency(context, width, height)
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', JPEG_QUALITY)

    return { dataUrl, width, height }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
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

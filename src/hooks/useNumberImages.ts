import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredImages,
  loadStoredImages,
  prepareImages,
  scanFolder,
  storeImages,
  type FolderScan,
} from '../lib/numberImages'
import { useLocalStorage } from './useLocalStorage'

export const DEFAULT_IMAGE_TIMEOUT_SECONDS = 8

export interface ImportProgress {
  done: number
  total: number
}

export interface ImportResult extends Omit<FolderScan, 'matches'> {
  loaded: number
  /** False when the images could not be saved: they work until the page is closed. */
  isPersisted: boolean
}

function toObjectUrls(blobs: Map<number, Blob>): Map<number, string> {
  return new Map([...blobs].map(([value, blob]) => [value, URL.createObjectURL(blob)]))
}

const normalizeTimeout = (value: unknown) =>
  typeof value === 'number' && value >= 0 ? value : DEFAULT_IMAGE_TIMEOUT_SECONDS

/** Images shown when their number is drawn, as object URLs by number. */
export function useNumberImages() {
  const [images, setImages] = useState<Map<number, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [timeoutSeconds, setTimeoutSeconds] = useLocalStorage(
    'tombola.numberImages.timeout',
    DEFAULT_IMAGE_TIMEOUT_SECONDS,
    normalizeTimeout,
  )

  useEffect(() => {
    let isCancelled = false
    loadStoredImages()
      .then((blobs) => !isCancelled && setImages(toObjectUrls(blobs)))
      .catch(() => {
        // IndexedDB unavailable (e.g. some private modes): start without images.
      })
      .finally(() => !isCancelled && setIsLoading(false))
    return () => {
      isCancelled = true
    }
  }, [])

  // Release the object URLs of a set of images once it is replaced.
  useEffect(() => () => images.forEach((url) => URL.revokeObjectURL(url)), [images])

  const importFolder = useCallback(async (files: FileList): Promise<ImportResult> => {
    const { matches, duplicates, ignored } = scanFolder(files)
    const blobs = await prepareImages(matches, (done, total) => setProgress({ done, total }))
    setProgress(null)

    let isPersisted = true
    try {
      await storeImages(blobs)
    } catch {
      isPersisted = false
    }
    setImages(toObjectUrls(blobs))
    return { loaded: blobs.size, duplicates, ignored, isPersisted }
  }, [])

  const clear = useCallback(async () => {
    setImages(new Map())
    try {
      await clearStoredImages()
    } catch {
      // Nothing stored.
    }
  }, [])

  return { images, isLoading, progress, importFolder, clear, timeoutSeconds, setTimeoutSeconds }
}

export type NumberImages = ReturnType<typeof useNumberImages>

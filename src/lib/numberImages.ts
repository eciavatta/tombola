/**
 * Images associated with the board numbers: matched by file name
 * (`7.jpg`, `07.png`, ...) and stored in IndexedDB, so they survive reloads.
 */

import { readImageBlob } from './image'
import { TOTAL_NUMBERS } from './series'

const DB_NAME = 'tombola'
const DB_VERSION = 1
const STORE_NAME = 'numberImages'

/** Big enough for a full-screen overlay, small enough to keep storage reasonable. */
const MAX_IMAGE_SIDE = 1920

const IMAGE_EXTENSION = /\.(png|jpe?g|webp|gif|bmp|avif)$/i
/** The name is a number, optionally with leading zeros: `7.jpg`, `07.png`, `007.webp`. */
const NUMBER_NAME = /^0*(\d+)\.[^.]+$/

export interface FolderScan {
  /** One file per number, in number order. */
  matches: Map<number, File>
  /** Files named like a number that already had an image (e.g. `07.png` after `7.jpg`). */
  duplicates: string[]
  /** Images whose name is not a number between 1 and 90. */
  ignored: string[]
}

/**
 * Finds the images named after a board number among the files of a folder
 * selection. Only files directly inside the chosen folder are considered.
 */
export function scanFolder(files: FileList | File[]): FolderScan {
  const matches = new Map<number, File>()
  const duplicates: string[] = []
  const ignored: string[] = []

  const sorted = [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  )
  for (const file of sorted) {
    // `webkitRelativePath` is "folder/name.jpg" for direct children.
    const depth = file.webkitRelativePath ? file.webkitRelativePath.split('/').length : 2
    if (depth !== 2 || !IMAGE_EXTENSION.test(file.name)) continue

    const match = NUMBER_NAME.exec(file.name)
    const value = match ? Number(match[1]) : NaN
    if (!(value >= 1 && value <= TOTAL_NUMBERS)) {
      ignored.push(file.name)
    } else if (matches.has(value)) {
      duplicates.push(file.name)
    } else {
      matches.set(value, file)
    }
  }

  return {
    matches: new Map([...matches].sort(([a], [b]) => a - b)),
    duplicates,
    ignored,
  }
}

/** Scales the matched images down, reporting progress as (done, total). */
export async function prepareImages(
  matches: Map<number, File>,
  onProgress: (done: number, total: number) => void,
): Promise<Map<number, Blob>> {
  const result = new Map<number, Blob>()
  let done = 0
  onProgress(done, matches.size)
  for (const [value, file] of matches) {
    try {
      result.set(value, await readImageBlob(file, MAX_IMAGE_SIDE))
    } catch {
      // Unreadable image: skip it.
    }
    onProgress(++done, matches.size)
  }
  return result
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDatabase()
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode)
      const request = run(transaction.objectStore(STORE_NAME))
      transaction.oncomplete = () => resolve(request ? request.result : undefined)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function loadStoredImages(): Promise<Map<number, Blob>> {
  const result = new Map<number, Blob>()
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) return resolve()
        result.set(Number(cursor.key), cursor.value as Blob)
        cursor.continue()
      }
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
  return result
}

/** Replaces all the stored images. */
export async function storeImages(images: Map<number, Blob>): Promise<void> {
  await withStore('readwrite', (store) => {
    store.clear()
    for (const [value, blob] of images) store.put(blob, value)
  })
}

export async function clearStoredImages(): Promise<void> {
  await withStore('readwrite', (store) => store.clear())
}

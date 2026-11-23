import { useCallback, useState } from 'react'
import { BoardSection } from './components/BoardSection'
import { CardsSection } from './components/CardsSection'
import { EventTitle } from './components/EventTitle'
import { FullscreenButton } from './components/FullscreenButton'
import { NumberImageOverlay } from './components/NumberImageOverlay'
import { NumberImagesSection } from './components/NumberImagesSection'
import { ThemeSelect } from './components/ThemeSelect'
import { useFullscreen } from './hooks/useFullscreen'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNumberImages } from './hooks/useNumberImages'

const CURRENT_YEAR = new Date().getFullYear()

export default function App() {
  const [drawnNumbers, setDrawnNumbers] = useLocalStorage<number[]>('tombola.drawnNumbers', [])
  // Full screen = presentation mode: setup controls are hidden.
  const isFullscreen = useFullscreen()
  const numberImages = useNumberImages()
  // Number whose image is shown full screen.
  const [shownImageNumber, setShownImageNumber] = useState<number | null>(null)
  const shownImageUrl =
    shownImageNumber === null ? undefined : numberImages.images.get(shownImageNumber)
  const closeImage = useCallback(() => setShownImageNumber(null), [])

  const handleNumberMarked = (value: number) => {
    // A new number replaces the image of the previous one (or closes it).
    setShownImageNumber(value)
  }

  return (
    <div
      data-presentation={isFullscreen || undefined}
      className="flex min-h-screen flex-col bg-page text-fg stage:h-dvh stage:overflow-hidden"
    >
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 stage:max-w-none stage:py-2">
          <EventTitle />
          <div className="flex items-center gap-2 presentation:hidden">
            <FullscreenButton />
            <ThemeSelect />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 p-4 sm:p-6 stage:min-h-0 stage:max-w-none stage:py-4">
        <BoardSection
          drawnNumbers={drawnNumbers}
          onDrawnNumbersChange={setDrawnNumbers}
          onNumberMarked={handleNumberMarked}
        />
        <div className="grid items-start gap-6 lg:grid-cols-2 presentation:hidden">
          <CardsSection />
          <NumberImagesSection numberImages={numberImages} onPreview={setShownImageNumber} />
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted stage:py-2 stage:text-xs">
        © {CURRENT_YEAR}{' '}
        <a
          href="https://eciavatta.dev/"
          target="_blank"
          rel="noopener"
          className="font-medium text-fg hover:text-accent"
        >
          Emiliano Ciavatta
        </a>
      </footer>


      {shownImageNumber !== null && shownImageUrl && (
        <NumberImageOverlay
          // Each number restarts the overlay, including its auto-close timer.
          key={shownImageNumber}
          value={shownImageNumber}
          imageUrl={shownImageUrl}
          timeoutSeconds={numberImages.timeoutSeconds}
          onClose={closeImage}
        />
      )}
    </div>
  )
}

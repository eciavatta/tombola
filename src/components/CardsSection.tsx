import { useState } from 'react'
import { PrintDialog } from './print/PrintDialog'
import { panelClass, primaryButtonClass } from './ui'

export function CardsSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <section
      className={`${panelClass} flex flex-col gap-4 p-5 presentation:hidden sm:flex-row sm:items-center sm:justify-between`}
    >
      <div>
        <h2 className="text-lg font-semibold">Cartelle</h2>
        <p className="text-sm text-muted">
          Genera le cartelle in serie da 6 e scaricale in un PDF pronto da stampare.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className={`${primaryButtonClass} shrink-0 whitespace-nowrap`}
      >
        Stampa cartelle
      </button>

      {isDialogOpen && <PrintDialog onClose={() => setIsDialogOpen(false)} />}
    </section>
  )
}

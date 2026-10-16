'use client'

import { useEffect, useState } from 'react'
import { Hand, Keyboard } from 'lucide-react'

interface ControlsHintProps {
  isTouch: boolean
  onTick: (remaining: number) => void
  onDone: () => void
}

const START_COUNT = 3

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-secondary font-display text-xs font-bold text-foreground shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)]">
      {children}
    </kbd>
  )
}

export function ControlsHint({ isTouch, onTick, onDone }: ControlsHintProps) {
  const [count, setCount] = useState(START_COUNT)

  useEffect(() => {
    onTick(count)
    const id = window.setTimeout(() => {
      if (count <= 1) onDone()
      else setCount(count - 1)
    }, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/40 p-4 text-center animate-in fade-in duration-300">
      <span
        key={count}
        className="animate-pop font-display text-7xl font-black text-primary drop-shadow-[0_0_24px_var(--primary)] sm:text-8xl"
        aria-live="assertive"
      >
        {count}
      </span>

      <div className="max-w-sm rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        {isTouch ? (
          <div className="flex flex-col items-center gap-3">
            <Hand className="size-8 text-primary" aria-hidden="true" />
            <p className="font-display text-sm font-bold tracking-wider uppercase">Arraste o dedo</p>
            <p className="text-sm text-muted-foreground">
              Deslize em qualquer lugar da tela para mover a nave. Desvie dos asteroides e pegue as estrelas.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Keyboard className="size-8 text-primary" aria-hidden="true" />
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-3 gap-1">
                <span />
                <Key>W</Key>
                <span />
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key>
              </div>
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="grid grid-cols-3 gap-1">
                <span />
                <Key>↑</Key>
                <span />
                <Key>←</Key>
                <Key>↓</Key>
                <Key>→</Key>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mova a nave, desvie dos asteroides e pegue as estrelas. <Key>P</Key> pausa o jogo.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

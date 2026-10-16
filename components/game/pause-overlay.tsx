import { Home, Play, RotateCcw } from 'lucide-react'
import { NeonButton } from './neon-button'

interface PauseOverlayProps {
  onResume: () => void
  onRestart: () => void
  onHome: () => void
}

export function PauseOverlay({ onResume, onRestart, onHome }: PauseOverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="absolute inset-0 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-border bg-card/90 p-6 text-center animate-in zoom-in-95 duration-200">
        <h2 id="pause-title" className="font-display text-3xl font-black tracking-wider uppercase">
          Pausado
        </h2>
        <p className="text-sm text-muted-foreground">Respire fundo, piloto.</p>
        <NeonButton onClick={onResume} className="w-full" autoFocus>
          <Play className="size-4 fill-current" aria-hidden="true" />
          Continuar
        </NeonButton>
        <NeonButton variant="ghost" onClick={onRestart} className="w-full">
          <RotateCcw className="size-4" aria-hidden="true" />
          Reiniciar
        </NeonButton>
        <NeonButton variant="ghost" onClick={onHome} className="w-full">
          <Home className="size-4" aria-hidden="true" />
          Início
        </NeonButton>
      </div>
    </div>
  )
}

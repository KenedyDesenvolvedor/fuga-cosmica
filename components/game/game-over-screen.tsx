import { Home, RotateCcw, Sparkles } from 'lucide-react'
import { formatTime } from '@/lib/game/storage'
import type { GameStats } from '@/lib/game/types'
import { NeonButton } from './neon-button'

interface GameOverScreenProps {
  stats: GameStats
  record: number
  isNewRecord: boolean
  onRestart: () => void
  onHome: () => void
}

export function GameOverScreen({ stats, record, isNewRecord, onRestart, onHome }: GameOverScreenProps) {
  const rows = [
    { label: 'Tempo', value: formatTime(stats.time) },
    { label: 'Estrelas', value: stats.stars },
    { label: 'Nível', value: stats.level },
    { label: 'Recorde', value: record },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-background/70 p-4 backdrop-blur-sm animate-in fade-in duration-500"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-card/90 p-6 text-center shadow-[0_0_60px_-20px_var(--accent)] animate-in zoom-in-90 slide-in-from-bottom-4 duration-500 sm:p-8">
        <h2
          id="game-over-title"
          className="font-display text-3xl font-black tracking-wider text-destructive uppercase drop-shadow-[0_0_16px_var(--destructive)] sm:text-4xl"
        >
          Fim de jogo
        </h2>

        {isNewRecord && (
          <p className="flex items-center gap-2 rounded-full border border-star/50 bg-star/10 px-4 py-1.5 font-display text-xs font-bold tracking-widest text-star uppercase animate-in zoom-in duration-500">
            <Sparkles className="size-4" aria-hidden="true" />
            Novo recorde!
          </p>
        )}

        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Pontuação</p>
          <p className="font-display text-5xl font-black tabular-nums text-foreground sm:text-6xl">{stats.score}</p>
        </div>

        <dl className="grid w-full grid-cols-2 gap-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-secondary/50 px-3 py-2">
              <dt className="text-[11px] tracking-widest text-muted-foreground uppercase">{row.label}</dt>
              <dd className="font-display text-lg font-bold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full flex-col gap-3">
          <NeonButton onClick={onRestart} className="w-full" autoFocus>
            <RotateCcw className="size-4" aria-hidden="true" />
            Jogar novamente
          </NeonButton>
          <NeonButton variant="ghost" onClick={onHome} className="w-full">
            <Home className="size-4" aria-hidden="true" />
            Início
          </NeonButton>
        </div>
      </div>
    </div>
  )
}

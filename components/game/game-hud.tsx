import { Pause, Play, Star, Timer, Trophy, Volume2, VolumeX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatTime } from '@/lib/game/storage'
import type { GamePhase, GameStats } from '@/lib/game/types'
import { cn } from '@/lib/utils'
import { NeonButton } from './neon-button'

interface GameHudProps {
  stats: GameStats
  record: number
  phase: GamePhase
  soundOn: boolean
  onTogglePause: () => void
  onToggleSound: () => void
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/60 px-2.5 py-1.5 backdrop-blur transition-colors sm:px-3.5 sm:py-2',
        highlight && 'border-star/60 shadow-[0_0_16px_-6px_var(--star)]',
      )}
    >
      <Icon className={cn('hidden size-4 shrink-0 sm:block', highlight ? 'text-star' : 'text-primary')} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase sm:text-xs">{label}</p>
        <p className="truncate font-display text-sm font-bold tabular-nums sm:text-lg">{value}</p>
      </div>
    </div>
  )
}

export function GameHud({ stats, record, phase, soundOn, onTogglePause, onToggleSound }: GameHudProps) {
  const beatingRecord = stats.score > record && record > 0
  const canPause = phase === 'playing' || phase === 'paused'

  return (
    <header className="flex items-center gap-2 sm:gap-3">
      <p className="mr-2 hidden font-display text-lg font-black tracking-wider uppercase lg:block">
        Fuga <span className="text-primary">Cósmica</span>
      </p>
      <div className="grid flex-1 grid-cols-3 gap-2 sm:flex sm:gap-3" aria-live="off">
        <Stat icon={Star} label="Pontos" value={stats.score} />
        <Stat icon={Timer} label="Tempo" value={formatTime(stats.time)} />
        <Stat icon={Trophy} label="Recorde" value={Math.max(record, stats.score)} highlight={beatingRecord} />
      </div>
      <div className="flex gap-2">
        <NeonButton
          variant="ghost"
          size="icon"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Desativar som' : 'Ativar som'}
        >
          {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </NeonButton>
        <NeonButton
          variant="ghost"
          size="icon"
          onClick={onTogglePause}
          disabled={!canPause}
          aria-label={phase === 'paused' ? 'Continuar' : 'Pausar'}
        >
          {phase === 'paused' ? <Play className="size-5" /> : <Pause className="size-5" />}
        </NeonButton>
      </div>
    </header>
  )
}

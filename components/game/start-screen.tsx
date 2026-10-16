import { Play, Shield, Star, Trophy, Volume2, VolumeX, Zap } from 'lucide-react'
import { NeonButton } from './neon-button'
import { ShipIcon } from './ship-icon'

interface StartScreenProps {
  record: number
  soundOn: boolean
  onPlay: () => void
  onToggleSound: () => void
}

const FEATURES = [
  { icon: Shield, title: 'Desvie', text: 'Escape dos asteroides que caem do espaço.' },
  { icon: Star, title: 'Colete', text: 'Cada estrela vale +100 pontos extras.' },
  { icon: Zap, title: 'Sobreviva', text: 'A cada nível, tudo fica mais rápido.' },
]

export function StartScreen({ record, soundOn, onPlay, onToggleSound }: StartScreenProps) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10 text-center animate-in fade-in zoom-in-95 duration-500">
      <NeonButton
        variant="ghost"
        size="icon"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Desativar som' : 'Ativar som'}
        className="absolute right-4 top-4"
      >
        {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
      </NeonButton>

      <ShipIcon className="mb-6 h-24 w-20 animate-float sm:h-28 sm:w-24" />

      <p className="mb-3 font-display text-xs font-medium tracking-[0.4em] text-primary uppercase">
        Arcade espacial
      </p>
      <h1 className="animate-glow bg-gradient-to-b from-white via-sky-200 to-violet-300 bg-clip-text font-display text-5xl font-black tracking-wide text-balance text-transparent uppercase sm:text-7xl">
        Fuga Cósmica
      </h1>
      <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground sm:text-lg">
        Pilote sua nave por um campo de asteroides, colete estrelas e sobreviva o máximo que conseguir. Quanto
        mais tempo você resiste, mais rápido o cosmos fica.
      </p>

      <ul className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 text-left backdrop-blur sm:flex-col sm:items-start"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-sm font-bold tracking-wider uppercase">{title}</span>
              <span className="block text-sm text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <NeonButton size="lg" onClick={onPlay} className="mt-10" autoFocus>
        <Play className="size-5 fill-current" aria-hidden="true" />
        Jogar
      </NeonButton>

      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="size-4 text-star" aria-hidden="true" />
        Recorde: <span className="font-display font-bold text-foreground tabular-nums">{record}</span>
      </p>
    </section>
  )
}

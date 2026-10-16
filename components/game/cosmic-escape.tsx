'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx, unlockAudio } from '@/lib/game/audio'
import { loadRecord, loadSound, saveRecord, saveSound } from '@/lib/game/storage'
import type { GameEvent, GamePhase, GameStats } from '@/lib/game/types'
import { ControlsHint } from './controls-hint'
import { GameCanvas } from './game-canvas'
import { GameHud } from './game-hud'
import { GameOverScreen } from './game-over-screen'
import { PauseOverlay } from './pause-overlay'
import { StarfieldBackdrop } from './starfield-backdrop'
import { StartScreen } from './start-screen'

type Screen = 'menu' | 'game'

const EMPTY_STATS: GameStats = { score: 0, time: 0, level: 1, stars: 0 }

export function CosmicEscape() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [phase, setPhase] = useState<GamePhase>('countdown')
  const [runId, setRunId] = useState(0)
  const [stats, setStats] = useState<GameStats>(EMPTY_STATS)
  const [record, setRecord] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [isTouch, setIsTouch] = useState(false)
  const [result, setResult] = useState<{ stats: GameStats; isNewRecord: boolean } | null>(null)

  const soundRef = useRef(soundOn)
  const recordRef = useRef(record)
  soundRef.current = soundOn
  recordRef.current = record

  useEffect(() => {
    setRecord(loadRecord())
    setSoundOn(loadSound())
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const play = useCallback((effect: keyof typeof sfx) => {
    if (soundRef.current) sfx[effect]()
  }, [])

  const startGame = useCallback(() => {
    unlockAudio()
    play('click')
    setStats(EMPTY_STATS)
    setResult(null)
    setRunId((id) => id + 1)
    setPhase('countdown')
    setScreen('game')
  }, [play])

  const goHome = useCallback(() => {
    play('click')
    setScreen('menu')
    setResult(null)
  }, [play])

  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
  }, [])

  const toggleSound = useCallback(() => {
    unlockAudio()
    const next = !soundRef.current
    soundRef.current = next
    saveSound(next)
    if (next) sfx.click()
    setSoundOn(next)
  }, [])

  const handleEvent = useCallback(
    (event: GameEvent, current: GameStats) => {
      if (event.type === 'star') play('star')
      else if (event.type === 'levelup') play('levelUp')
      else if (event.type === 'crash') {
        play('crash')
        if (navigator.vibrate) navigator.vibrate(180)
        setStats(current)
      } else if (event.type === 'dead') {
        const isNewRecord = current.score > recordRef.current
        if (isNewRecord) {
          saveRecord(current.score)
          setRecord(current.score)
        }
        setStats(current)
        setResult({ stats: current, isNewRecord })
        setPhase('over')
      }
    },
    [play],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game') return
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault()
        togglePause()
      }
    }
    const onVisibility = () => {
      if (document.hidden) setPhase((p) => (p === 'playing' ? 'paused' : p))
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [screen, togglePause])

  return (
    <main className="relative min-h-dvh overflow-hidden text-foreground">
      <StarfieldBackdrop />

      {screen === 'menu' ? (
        <StartScreen record={record} soundOn={soundOn} onPlay={startGame} onToggleSound={toggleSound} />
      ) : (
        <section
          aria-label="Partida em andamento"
          className="mx-auto flex h-dvh w-full max-w-5xl flex-col gap-3 p-3 animate-in fade-in duration-500 sm:gap-4 sm:p-5"
        >
          <GameHud
            stats={stats}
            record={record}
            phase={phase}
            soundOn={soundOn}
            onTogglePause={togglePause}
            onToggleSound={toggleSound}
          />

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-primary/30 shadow-[0_0_40px_-12px_var(--primary),inset_0_0_40px_-20px_var(--accent)]">
            <GameCanvas phase={phase} runId={runId} onStats={setStats} onEvent={handleEvent} />

            {phase === 'countdown' && (
              <ControlsHint
                key={runId}
                isTouch={isTouch}
                onTick={() => play('countdown')}
                onDone={() => {
                  if (soundRef.current) sfx.countdown(true)
                  setPhase('playing')
                }}
              />
            )}

            {phase === 'paused' && (
              <PauseOverlay onResume={togglePause} onRestart={startGame} onHome={goHome} />
            )}

            {phase === 'over' && result && (
              <GameOverScreen
                stats={result.stats}
                record={record}
                isNewRecord={result.isNewRecord}
                onRestart={startGame}
                onHome={goHome}
              />
            )}
          </div>

          <p className="hidden text-center text-xs text-muted-foreground sm:block">
            Setas ou WASD para mover · P ou Esc para pausar · arraste na área do jogo no celular
          </p>
        </section>
      )}
    </main>
  )
}

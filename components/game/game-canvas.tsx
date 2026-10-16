'use client'

import { useEffect, useRef } from 'react'
import { createGame, getScore, resizeGame, updateGame } from '@/lib/game/engine'
import { renderGame } from '@/lib/game/renderer'
import type { GameEvent, GameInput, GamePhase, GameState, GameStats } from '@/lib/game/types'

interface GameCanvasProps {
  phase: GamePhase
  runId: number
  onStats: (stats: GameStats) => void
  onEvent: (event: GameEvent, stats: GameStats) => void
}

const KEY_MAP: Record<string, keyof Pick<GameInput, 'up' | 'down' | 'left' | 'right'>> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

const DRAG_SENSITIVITY = 1.35

function readStats(game: GameState): GameStats {
  return { score: getScore(game), time: game.time, level: game.level, stars: game.starsCollected }
}

export function GameCanvas({ phase, runId, onStats, onEvent }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameState | null>(null)
  const phaseRef = useRef(phase)
  const callbacksRef = useRef({ onStats, onEvent })
  const inputRef = useRef<GameInput>({
    up: false,
    down: false,
    left: false,
    right: false,
    pointerActive: false,
    pointerX: 0,
    pointerY: 0,
  })
  const dragRef = useRef<{ id: number; px: number; py: number; sx: number; sy: number } | null>(null)

  phaseRef.current = phase
  callbacksRef.current = { onStats, onEvent }

  useEffect(() => {
    const game = gameRef.current
    if (game) gameRef.current = createGame(game.width, game.height)
  }, [runId])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = 1
    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      if (!gameRef.current) gameRef.current = createGame(width, height)
      else resizeGame(gameRef.current, width, height)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    let raf = 0
    let last = performance.now()
    let hudTimer = 0

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const game = gameRef.current
      if (game) {
        const currentPhase = phaseRef.current
        if (currentPhase !== 'paused') {
          const events = updateGame(game, dt, inputRef.current, currentPhase)
          if (events.length) {
            const stats = readStats(game)
            for (const event of events) callbacksRef.current.onEvent(event, stats)
          }
        }
        renderGame(ctx, game, dpr)

        hudTimer -= dt
        if (hudTimer <= 0 && currentPhase === 'playing') {
          hudTimer = 0.1
          callbacksRef.current.onStats(readStats(game))
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const setKey = (e: KeyboardEvent, pressed: boolean) => {
      const key = KEY_MAP[e.code]
      if (!key) return
      e.preventDefault()
      inputRef.current[key] = pressed
      if (pressed) inputRef.current.pointerActive = false
    }
    const onKeyDown = (e: KeyboardEvent) => setKey(e, true)
    const onKeyUp = (e: KeyboardEvent) => setKey(e, false)
    const onBlur = () => {
      const input = inputRef.current
      input.up = input.down = input.left = input.right = false
      input.pointerActive = false
      dragRef.current = null
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const game = gameRef.current
    if (!game || dragRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { id: e.pointerId, px: e.clientX, py: e.clientY, sx: game.ship.x, sy: game.ship.y }
    inputRef.current.pointerActive = true
    inputRef.current.pointerX = game.ship.x
    inputRef.current.pointerY = game.ship.y
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const game = gameRef.current
    if (!drag || !game || drag.id !== e.pointerId) return
    const x = drag.sx + (e.clientX - drag.px) * DRAG_SENSITIVITY
    const y = drag.sy + (e.clientY - drag.py) * DRAG_SENSITIVITY
    const clampedX = Math.min(game.width, Math.max(0, x))
    const clampedY = Math.min(game.height, Math.max(0, y))
    // Re-anchor at the edges so reversing direction responds immediately.
    if (clampedX !== x) {
      drag.sx = clampedX
      drag.px = e.clientX
    }
    if (clampedY !== y) {
      drag.sy = clampedY
      drag.py = e.clientY
    }
    inputRef.current.pointerX = clampedX
    inputRef.current.pointerY = clampedY
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return
    dragRef.current = null
    inputRef.current.pointerActive = false
    const game = gameRef.current
    if (game) {
      game.ship.vx = 0
      game.ship.vy = 0
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        className="block"
        role="img"
        aria-label="Área do jogo: nave espacial desviando de asteroides e coletando estrelas"
      />
    </div>
  )
}

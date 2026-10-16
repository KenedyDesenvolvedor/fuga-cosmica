export type Action =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'jump'
  | 'slide'
  | 'fire'
  | 'reload'
  | 'nitro'
  | 'interact'
  | 'crouch'

export interface Vec {
  x: number
  y: number
}

export interface InputState {
  held: ReadonlySet<Action>
  pressed: ReadonlySet<Action>
  /** Combined movement vector from keyboard and the move stick, length <= 1. */
  move: Vec
  /** Normalized aim direction from the aim stick, null when idle. */
  aim: Vec | null
  /** Mouse position in canvas CSS pixels. */
  pointer: Vec & { active: boolean }
}

export type SfxName =
  | 'jump'
  | 'coin'
  | 'hit'
  | 'shoot'
  | 'explode'
  | 'win'
  | 'lose'
  | 'reload'
  | 'checkpoint'
  | 'alert'
  | 'powerup'
  | 'empty'
  | 'click'
  | 'nitro'

export interface Sfx {
  play(name: SfxName): void
}

export type Tone = 'default' | 'good' | 'danger' | 'warn'

export interface HudStat {
  label: string
  value: string
  tone?: Tone
}

export interface HudBar {
  label: string
  value: number
  tone?: Tone
}

export interface HudData {
  stats: HudStat[]
  bars?: HudBar[]
}

export interface GameResult {
  won: boolean
  score: number
  title: string
  message: string
  stats: HudStat[]
}

export interface EngineContext {
  width: number
  height: number
  sfx: Sfx
  isTouch: boolean
}

export interface GameEngine {
  update(dt: number, input: InputState): void
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void
  resize(width: number, height: number): void
  getHud(): HudData
  getResult(): GameResult | null
}

export type EngineFactory = (ctx: EngineContext) => GameEngine

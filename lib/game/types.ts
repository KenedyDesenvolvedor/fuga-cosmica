export type GamePhase = 'countdown' | 'playing' | 'paused' | 'over'

export interface Ship {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  tilt: number
}

export interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  rotation: number
  spin: number
  shape: number[]
  craters: { angle: number; dist: number; size: number }[]
  tint: number
}

export interface Pickup {
  x: number
  y: number
  vy: number
  radius: number
  phase: number
  rotation: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export interface FloatingText {
  x: number
  y: number
  life: number
  text: string
}

export interface BgStar {
  x: number
  y: number
  size: number
  layer: number
  alpha: number
  twinkle: number
}

export type ShipStatus = 'running' | 'dying' | 'dead'

export interface GameState {
  width: number
  height: number
  scale: number
  ship: Ship
  asteroids: Asteroid[]
  pickups: Pickup[]
  particles: Particle[]
  texts: FloatingText[]
  bgStars: BgStar[]
  time: number
  elapsed: number
  bonus: number
  starsCollected: number
  level: number
  spawnTimer: number
  pickupTimer: number
  trailTimer: number
  status: ShipStatus
  deathTimer: number
  shake: number
  flash: number
  banner: { text: string; life: number } | null
}

export interface GameInput {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  pointerActive: boolean
  pointerX: number
  pointerY: number
}

export type GameEvent =
  | { type: 'star' }
  | { type: 'crash' }
  | { type: 'dead' }
  | { type: 'levelup'; level: number }

export interface GameStats {
  score: number
  time: number
  level: number
  stars: number
}

import type {
  Asteroid,
  BgStar,
  GameEvent,
  GameInput,
  GamePhase,
  GameState,
  Particle,
} from './types'

export const STAR_POINTS = 100
const POINTS_PER_SECOND = 10
const MAX_PARTICLES = 320
const LEVEL_DURATION = 15

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function getDifficulty(time: number) {
  return {
    level: 1 + Math.floor(time / LEVEL_DURATION),
    speedMul: Math.min(1 + time * 0.02, 3),
    spawnInterval: Math.max(0.22, 0.9 - time * 0.009),
  }
}

export function getScore(state: GameState) {
  return Math.floor(state.time * POINTS_PER_SECOND) + state.bonus
}

function computeScale(width: number, height: number) {
  return clamp(Math.min(width, height) / 640, 0.6, 1.25)
}

function createBgStars(width: number, height: number): BgStar[] {
  const count = Math.min(220, Math.round((width * height) / 5000))
  return Array.from({ length: count }, () => {
    const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + layer * 0.6 + Math.random() * 0.5,
      layer,
      alpha: 0.3 + layer * 0.2 + Math.random() * 0.3,
      twinkle: Math.random() * Math.PI * 2,
    }
  })
}

export function createGame(width: number, height: number): GameState {
  const scale = computeScale(width, height)
  return {
    width,
    height,
    scale,
    ship: { x: width / 2, y: height * 0.78, vx: 0, vy: 0, radius: 16 * scale, tilt: 0 },
    asteroids: [],
    pickups: [],
    particles: [],
    texts: [],
    bgStars: createBgStars(width, height),
    time: 0,
    elapsed: 0,
    bonus: 0,
    starsCollected: 0,
    level: 1,
    spawnTimer: 0.6,
    pickupTimer: 2.5,
    trailTimer: 0,
    status: 'running',
    deathTimer: 0,
    shake: 0,
    flash: 0,
    banner: null,
  }
}

export function resizeGame(state: GameState, width: number, height: number) {
  if (width === state.width && height === state.height) return
  const sx = width / state.width
  const sy = height / state.height
  state.ship.x *= sx
  state.ship.y *= sy
  for (const a of state.asteroids) a.x *= sx
  for (const p of state.pickups) p.x *= sx
  state.width = width
  state.height = height
  state.scale = computeScale(width, height)
  state.ship.radius = 16 * state.scale
  state.bgStars = createBgStars(width, height)
}

function spawnAsteroid(state: GameState, speedMul: number) {
  const { width, height, scale, time } = state
  const big = Math.random() < 0.12
  const baseSize = rand(14, 38)
  const radius = baseSize * scale * (big ? 1.5 : 1)
  const aimed = time > 10 && Math.random() < 0.22
  let x = aimed
    ? clamp(state.ship.x + rand(-width * 0.12, width * 0.12), radius, width - radius)
    : rand(radius, width - radius)
  const safeZone = state.ship.radius * 3 + radius
  if (time < 4 && Math.abs(x - state.ship.x) < safeZone) {
    const side = x < state.ship.x ? -1 : 1
    x = clamp(state.ship.x + side * safeZone, radius, width - radius)
  }
  const sizeFactor = 1.2 - ((baseSize - 14) / 24) * 0.4
  const drift = time > 20 ? Math.min(1, (time - 20) / 40) * 0.07 : 0.015
  const vertices = Math.floor(rand(9, 13))

  const asteroid: Asteroid = {
    x,
    y: -radius * 1.5,
    vx: rand(-1, 1) * height * drift,
    vy: height * rand(0.22, 0.38) * speedMul * sizeFactor,
    radius,
    rotation: Math.random() * Math.PI * 2,
    spin: rand(-1.6, 1.6),
    shape: Array.from({ length: vertices }, () => rand(0.74, 1.05)),
    craters: Array.from({ length: Math.floor(rand(1, 4)) }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: rand(0.15, 0.5),
      size: rand(0.12, 0.24),
    })),
    tint: Math.random(),
  }
  state.asteroids.push(asteroid)
}

function spawnPickup(state: GameState, speedMul: number) {
  const radius = 13 * state.scale
  state.pickups.push({
    x: rand(radius * 2, state.width - radius * 2),
    y: -radius * 2,
    vy: state.height * 0.17 * Math.min(speedMul, 2),
    radius,
    phase: Math.random() * Math.PI * 2,
    rotation: 0,
  })
}

function burst(
  state: GameState,
  x: number,
  y: number,
  count: number,
  colors: string[],
  speed: number,
  life: number,
) {
  for (let i = 0; i < count; i++) {
    if (state.particles.length >= MAX_PARTICLES) state.particles.shift()
    const angle = Math.random() * Math.PI * 2
    const v = speed * rand(0.3, 1)
    const maxLife = life * rand(0.5, 1)
    const particle: Particle = {
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: maxLife,
      maxLife,
      size: rand(1.2, 3.2) * state.scale,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
    state.particles.push(particle)
  }
}

function updateShip(state: GameState, dt: number, input: GameInput) {
  const { ship, width, height } = state
  const maxSpeed = Math.min(width, height) * 1.15
  const ease = Math.min(1, dt * 14)

  if (input.pointerActive) {
    const tx = clamp(input.pointerX, ship.radius, width - ship.radius)
    const ty = clamp(input.pointerY, height * 0.12, height - ship.radius * 1.6)
    const follow = Math.min(1, dt * 18)
    const nx = ship.x + (tx - ship.x) * follow
    const ny = ship.y + (ty - ship.y) * follow
    ship.vx = (nx - ship.x) / dt
    ship.vy = (ny - ship.y) / dt
    ship.x = nx
    ship.y = ny
  } else {
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0)
    const len = Math.hypot(dx, dy)
    if (len > 0) {
      dx /= len
      dy /= len
    }
    ship.vx += (dx * maxSpeed - ship.vx) * ease
    ship.vy += (dy * maxSpeed - ship.vy) * ease
    ship.x += ship.vx * dt
    ship.y += ship.vy * dt
  }

  const minX = ship.radius
  const maxX = width - ship.radius
  const minY = height * 0.12
  const maxY = height - ship.radius * 1.6
  if (ship.x < minX || ship.x > maxX) ship.vx = 0
  if (ship.y < minY || ship.y > maxY) ship.vy = 0
  ship.x = clamp(ship.x, minX, maxX)
  ship.y = clamp(ship.y, minY, maxY)

  const targetTilt = clamp(ship.vx / maxSpeed, -1, 1) * 0.38
  ship.tilt += (targetTilt - ship.tilt) * ease
}

export function updateGame(
  state: GameState,
  dt: number,
  input: GameInput,
  phase: GamePhase,
): GameEvent[] {
  const events: GameEvent[] = []
  if (dt <= 0) return events
  state.elapsed += dt

  const playing = phase === 'playing' && state.status === 'running'
  const { speedMul, spawnInterval, level } = getDifficulty(state.time)
  const bgSpeed = phase === 'over' ? 0.6 : speedMul

  for (const s of state.bgStars) {
    s.y += (14 + s.layer * 34) * bgSpeed * state.scale * dt * 1.6
    if (s.y > state.height) {
      s.y = -2
      s.x = Math.random() * state.width
    }
  }

  if (state.status === 'running' && phase !== 'over') {
    updateShip(state, dt, input)
    state.trailTimer -= dt
    if (state.trailTimer <= 0) {
      state.trailTimer = 0.025
      const { ship } = state
      if (state.particles.length >= MAX_PARTICLES) state.particles.shift()
      state.particles.push({
        x: ship.x + rand(-3, 3) * state.scale,
        y: ship.y + ship.radius * 0.9,
        vx: rand(-20, 20),
        vy: rand(120, 200) * state.scale,
        life: 0.35,
        maxLife: 0.35,
        size: rand(1.5, 3) * state.scale,
        color: Math.random() < 0.5 ? '#38bdf8' : '#a855f7',
      })
    }
  }

  if (playing) {
    state.time += dt
    if (level > state.level) {
      state.level = level
      state.banner = { text: `Nível ${level}`, life: 1.6 }
      events.push({ type: 'levelup', level })
    }

    state.spawnTimer -= dt
    if (state.spawnTimer <= 0) {
      spawnAsteroid(state, speedMul)
      if (state.time > 35 && Math.random() < Math.min(0.35, (state.time - 35) / 120)) {
        spawnAsteroid(state, speedMul)
      }
      state.spawnTimer = spawnInterval * rand(0.6, 1.4)
    }

    state.pickupTimer -= dt
    if (state.pickupTimer <= 0) {
      spawnPickup(state, speedMul)
      state.pickupTimer = rand(2.2, 4.2)
    }
  }

  const { ship } = state
  for (let i = state.asteroids.length - 1; i >= 0; i--) {
    const a = state.asteroids[i]
    a.x += a.vx * dt
    a.y += a.vy * dt
    a.rotation += a.spin * dt
    if (a.x < a.radius || a.x > state.width - a.radius) a.vx *= -1
    if (a.y - a.radius * 2 > state.height) {
      state.asteroids.splice(i, 1)
      continue
    }
    if (playing) {
      const hitDist = a.radius * 0.82 + ship.radius * 0.62
      const dx = a.x - ship.x
      const dy = a.y - ship.y
      if (dx * dx + dy * dy < hitDist * hitDist) {
        state.status = 'dying'
        state.deathTimer = 1.1
        state.shake = 1
        state.flash = 1
        burst(state, ship.x, ship.y, 60, ['#38bdf8', '#a855f7', '#f472b6', '#fde68a', '#ffffff'], 380 * state.scale, 1.1)
        burst(state, a.x, a.y, 18, ['#6b5b95', '#9ca3af'], 160 * state.scale, 0.8)
        state.asteroids.splice(i, 1)
        events.push({ type: 'crash' })
      }
    }
  }

  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const p = state.pickups[i]
    p.y += p.vy * dt
    p.phase += dt * 4
    p.rotation += dt * 1.4
    if (p.y - p.radius * 2 > state.height) {
      state.pickups.splice(i, 1)
      continue
    }
    if (state.status === 'running' && phase === 'playing') {
      const r = p.radius + ship.radius
      const dx = p.x - ship.x
      const dy = p.y - ship.y
      if (dx * dx + dy * dy < r * r) {
        state.bonus += STAR_POINTS
        state.starsCollected += 1
        burst(state, p.x, p.y, 18, ['#fde68a', '#facc15', '#ffffff'], 220 * state.scale, 0.6)
        state.texts.push({ x: p.x, y: p.y, life: 1, text: `+${STAR_POINTS}` })
        state.pickups.splice(i, 1)
        events.push({ type: 'star' })
      }
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vx *= 1 - dt * 1.8
    p.vy *= 1 - dt * 1.8
    p.life -= dt
    if (p.life <= 0) state.particles.splice(i, 1)
  }

  for (let i = state.texts.length - 1; i >= 0; i--) {
    const t = state.texts[i]
    t.y -= 40 * state.scale * dt
    t.life -= dt * 1.2
    if (t.life <= 0) state.texts.splice(i, 1)
  }

  if (state.banner) {
    state.banner.life -= dt
    if (state.banner.life <= 0) state.banner = null
  }

  state.shake = Math.max(0, state.shake - dt * 2.2)
  state.flash = Math.max(0, state.flash - dt * 3)

  if (state.status === 'dying') {
    state.deathTimer -= dt
    if (state.deathTimer <= 0) {
      state.status = 'dead'
      events.push({ type: 'dead' })
    }
  }

  return events
}

import type { Asteroid, GameState, Pickup, Ship } from './types'

function drawBackground(ctx: CanvasRenderingContext2D, state: GameState) {
  const { width, height } = state
  ctx.fillStyle = '#050714'
  ctx.fillRect(0, 0, width, height)

  const n1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 0, width * 0.2, height * 0.25, width * 0.6)
  n1.addColorStop(0, 'rgba(124, 58, 237, 0.16)')
  n1.addColorStop(1, 'rgba(124, 58, 237, 0)')
  ctx.fillStyle = n1
  ctx.fillRect(0, 0, width, height)

  const n2 = ctx.createRadialGradient(width * 0.85, height * 0.75, 0, width * 0.85, height * 0.75, width * 0.55)
  n2.addColorStop(0, 'rgba(14, 165, 233, 0.12)')
  n2.addColorStop(1, 'rgba(14, 165, 233, 0)')
  ctx.fillStyle = n2
  ctx.fillRect(0, 0, width, height)

  for (const s of state.bgStars) {
    const twinkle = 0.75 + Math.sin(state.elapsed * 2 + s.twinkle) * 0.25
    ctx.globalAlpha = s.alpha * twinkle
    ctx.fillStyle = s.layer === 2 ? '#c4b5fd' : '#e0f2fe'
    if (s.layer === 2) {
      ctx.fillRect(s.x, s.y, s.size, s.size * 2.4)
    } else {
      ctx.fillRect(s.x, s.y, s.size, s.size)
    }
  }
  ctx.globalAlpha = 1
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
  ctx.save()
  ctx.translate(a.x, a.y)
  ctx.rotate(a.rotation)

  ctx.beginPath()
  const step = (Math.PI * 2) / a.shape.length
  a.shape.forEach((m, i) => {
    const x = Math.cos(i * step) * a.radius * m
    const y = Math.sin(i * step) * a.radius * m
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()

  const g = ctx.createRadialGradient(-a.radius * 0.35, -a.radius * 0.35, a.radius * 0.1, 0, 0, a.radius)
  g.addColorStop(0, a.tint > 0.5 ? '#4b4470' : '#43506e')
  g.addColorStop(1, '#16142a')
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = a.tint > 0.5 ? 'rgba(192, 132, 252, 0.75)' : 'rgba(125, 211, 252, 0.6)'
  ctx.stroke()

  ctx.fillStyle = 'rgba(8, 7, 20, 0.55)'
  for (const c of a.craters) {
    ctx.beginPath()
    ctx.arc(
      Math.cos(c.angle) * a.radius * c.dist,
      Math.sin(c.angle) * a.radius * c.dist,
      a.radius * c.size,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.restore()
}

function drawPickup(ctx: CanvasRenderingContext2D, p: Pickup) {
  const pulse = 1 + Math.sin(p.phase) * 0.12
  const r = p.radius * pulse
  ctx.save()
  ctx.translate(p.x, p.y)

  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.4)
  halo.addColorStop(0, 'rgba(250, 204, 21, 0.35)')
  halo.addColorStop(1, 'rgba(250, 204, 21, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.rotate(p.rotation)
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.shadowColor = '#facc15'
  ctx.shadowBlur = 14
  ctx.fillStyle = '#fde68a'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.lineWidth = 1.2
  ctx.strokeStyle = '#fffbeb'
  ctx.stroke()
  ctx.restore()
}

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, elapsed: number) {
  const r = ship.radius
  ctx.save()
  ctx.translate(ship.x, ship.y)
  ctx.rotate(ship.tilt)

  const flicker = 0.75 + Math.sin(elapsed * 40) * 0.15 + Math.random() * 0.15
  const flameLen = r * 1.5 * flicker
  const flame = ctx.createLinearGradient(0, r * 0.5, 0, r * 0.5 + flameLen)
  flame.addColorStop(0, 'rgba(224, 242, 254, 0.95)')
  flame.addColorStop(0.35, 'rgba(56, 189, 248, 0.85)')
  flame.addColorStop(1, 'rgba(168, 85, 247, 0)')
  ctx.fillStyle = flame
  ctx.beginPath()
  ctx.moveTo(-r * 0.38, r * 0.55)
  ctx.quadraticCurveTo(0, r * 0.5 + flameLen * 1.2, r * 0.38, r * 0.55)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -r * 1.3)
  ctx.lineTo(r * 0.42, -r * 0.2)
  ctx.lineTo(r, r * 0.85)
  ctx.lineTo(r * 0.35, r * 0.55)
  ctx.lineTo(-r * 0.35, r * 0.55)
  ctx.lineTo(-r, r * 0.85)
  ctx.lineTo(-r * 0.42, -r * 0.2)
  ctx.closePath()

  const body = ctx.createLinearGradient(0, -r * 1.3, 0, r)
  body.addColorStop(0, '#1e3a8a')
  body.addColorStop(1, '#0b1030')
  ctx.fillStyle = body
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#7dd3fc'
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.ellipse(0, -r * 0.35, r * 0.2, r * 0.38, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#c084fc'
  ctx.shadowColor = '#a855f7'
  ctx.shadowBlur = 10
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#f0abfc'
  ctx.fillRect(-r * 0.92, r * 0.62, r * 0.18, r * 0.14)
  ctx.fillRect(r * 0.74, r * 0.62, r * 0.18, r * 0.14)
  ctx.restore()
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const shakeAmount = state.shake * state.shake * 12 * state.scale
  const ox = shakeAmount ? (Math.random() - 0.5) * shakeAmount : 0
  const oy = shakeAmount ? (Math.random() - 0.5) * shakeAmount : 0
  ctx.translate(ox, oy)

  drawBackground(ctx, state)
  for (const p of state.pickups) drawPickup(ctx, p)
  for (const a of state.asteroids) drawAsteroid(ctx, a)

  ctx.globalCompositeOperation = 'lighter'
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  if (state.status === 'running') drawShip(ctx, state.ship, state.elapsed)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${Math.round(16 * state.scale + 4)}px ui-sans-serif, system-ui, sans-serif`
  for (const t of state.texts) {
    ctx.globalAlpha = Math.max(0, t.life)
    ctx.fillStyle = '#fde68a'
    ctx.fillText(t.text, t.x, t.y)
  }
  ctx.globalAlpha = 1

  if (state.banner) {
    const life = state.banner.life
    const alpha = Math.min(1, life * 2, (1.6 - life) * 4)
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.font = `800 ${Math.round(30 * state.scale + 6)}px ui-sans-serif, system-ui, sans-serif`
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 18
    ctx.fillStyle = '#e9d5ff'
    ctx.fillText(state.banner.text.toUpperCase(), state.width / 2, state.height * 0.35)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(244, 114, 182, ${state.flash * 0.35})`
    ctx.fillRect(0, 0, state.width, state.height)
  }
}

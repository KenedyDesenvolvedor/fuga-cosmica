import { rand } from './math'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  gravity: number
}

interface FloatText {
  x: number
  y: number
  text: string
  color: string
  life: number
}

/** Lightweight particles, floating texts, screen shake and flashes shared by every game. */
export class Fx {
  particles: Particle[] = []
  texts: FloatText[] = []
  shake = 0
  flashColor = '#ffffff'
  flashAlpha = 0
  bannerText = ''
  bannerSub = ''
  bannerTime = 0

  burst(x: number, y: number, color: string, count = 12, speed = 180, gravity = 0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const s = rand(speed * 0.3, speed)
      const max = rand(0.35, 0.8)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        life: max,
        max,
        size: rand(1.5, 4),
        color,
        gravity,
      })
    }
    if (this.particles.length > 400) this.particles.splice(0, this.particles.length - 400)
  }

  text(x: number, y: number, text: string, color = '#fde68a') {
    this.texts.push({ x, y, text, color, life: 0.9 })
  }

  flash(color: string, alpha = 0.35) {
    this.flashColor = color
    this.flashAlpha = alpha
  }

  banner(text: string, sub = '', time = 1.8) {
    this.bannerText = text
    this.bannerSub = sub
    this.bannerTime = time
  }

  addShake(amount: number) {
    this.shake = Math.max(this.shake, amount)
  }

  update(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += p.gravity * dt
      p.vx *= 0.96
      p.vy *= 0.96
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
    for (const t of this.texts) {
      t.y -= 40 * dt
      t.life -= dt
    }
    this.texts = this.texts.filter((t) => t.life > 0)
    this.shake = Math.max(0, this.shake - dt * 30)
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.5)
    this.bannerTime = Math.max(0, this.bannerTime - dt)
  }

  shakeOffset() {
    if (this.shake <= 0) return { x: 0, y: 0 }
    return { x: rand(-this.shake, this.shake), y: rand(-this.shake, this.shake) }
  }

  /** Call inside the world transform. */
  renderWorld(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.restore()
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = 'bold 14px var(--font-orbitron), system-ui, sans-serif'
    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, t.life * 2)
      ctx.fillStyle = t.color
      ctx.fillText(t.text, t.x, t.y)
    }
    ctx.restore()
  }

  /** Call in screen space after the world is drawn. */
  renderScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (this.flashAlpha > 0) {
      ctx.save()
      ctx.globalAlpha = this.flashAlpha
      ctx.fillStyle = this.flashColor
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
    if (this.bannerTime > 0) {
      const alpha = Math.min(1, this.bannerTime * 2.5)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const size = Math.max(22, Math.min(44, w / 14))
      ctx.font = `900 ${size}px var(--font-orbitron), system-ui, sans-serif`
      ctx.shadowColor = '#a855f7'
      ctx.shadowBlur = 24
      ctx.fillStyle = '#f5f3ff'
      ctx.fillText(this.bannerText, w / 2, h * 0.38)
      if (this.bannerSub) {
        ctx.shadowBlur = 0
        ctx.font = `600 ${Math.max(13, size * 0.4)}px var(--font-inter), system-ui, sans-serif`
        ctx.fillStyle = '#c7d2fe'
        ctx.fillText(this.bannerSub, w / 2, h * 0.38 + size * 0.9)
      }
      ctx.restore()
    }
  }
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const rand = (min: number, max: number) => min + Math.random() * (max - min)
export const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(bx - ax, by - ay)

export function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function circleRectOverlap(cx: number, cy: number, r: number, rect: Rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w)
  const ny = clamp(cy, rect.y, rect.y + rect.h)
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r
}

/** Pushes a circle out of a rectangle. Returns the corrected position. */
export function resolveCircleRect(cx: number, cy: number, r: number, rect: Rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w)
  const ny = clamp(cy, rect.y, rect.y + rect.h)
  const dx = cx - nx
  const dy = cy - ny
  const d2 = dx * dx + dy * dy
  if (d2 >= r * r) return null
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2)
    return { x: nx + (dx / d) * r, y: ny + (dy / d) * r }
  }
  const left = cx - rect.x
  const right = rect.x + rect.w - cx
  const top = cy - rect.y
  const bottom = rect.y + rect.h - cy
  const min = Math.min(left, right, top, bottom)
  if (min === left) return { x: rect.x - r, y: cy }
  if (min === right) return { x: rect.x + rect.w + r, y: cy }
  if (min === top) return { x: cx, y: rect.y - r }
  return { x: cx, y: rect.y + rect.h + r }
}

export function segmentHitsRect(x1: number, y1: number, x2: number, y2: number, rect: Rect) {
  let t0 = 0
  let t1 = 1
  const dx = x2 - x1
  const dy = y2 - y1
  const checks: [number, number][] = [
    [-dx, x1 - rect.x],
    [dx, rect.x + rect.w - x1],
    [-dy, y1 - rect.y],
    [dy, rect.y + rect.h - y1],
  ]
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return false
    } else {
      const t = q / p
      if (p < 0) {
        if (t > t1) return false
        if (t > t0) t0 = t
      } else {
        if (t < t0) return false
        if (t < t1) t1 = t
      }
    }
  }
  return true
}

export function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

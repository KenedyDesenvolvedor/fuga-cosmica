import type { Action, InputState, Vec } from './types'

export type KeyMap = Readonly<Record<string, Action>>

export const BASE_KEYMAP: KeyMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

const AIM_DEADZONE = 0.3

export class InputController {
  private keysHeld = new Map<string, Action>()
  private touchHeld = new Set<Action>()
  private pressed = new Set<Action>()
  private moveStick: Vec = { x: 0, y: 0 }
  private aimStick: Vec = { x: 0, y: 0 }
  private pointer = { x: 0, y: 0, active: false }
  private mouseDown = false

  constructor(private keymap: KeyMap) {}

  attach(canvas: HTMLCanvasElement) {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = this.keymap[e.code]
      if (!action) return
      e.preventDefault()
      if (!e.repeat) this.pressed.add(action)
      this.keysHeld.set(e.code, action)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      this.keysHeld.delete(e.code)
    }
    const onBlur = () => this.reset()
    const updatePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      this.pointer.x = e.clientX - rect.left
      this.pointer.y = e.clientY - rect.top
      this.pointer.active = true
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') updatePointer(e)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      updatePointer(e)
      this.mouseDown = true
      this.pressed.add('fire')
    }
    const onPointerUp = () => {
      this.mouseDown = false
    }
    const onContextMenu = (e: Event) => e.preventDefault()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
      this.reset()
    }
  }

  setStick(kind: 'move' | 'aim', x: number, y: number) {
    const target = kind === 'move' ? this.moveStick : this.aimStick
    target.x = x
    target.y = y
  }

  setButton(action: Action, down: boolean) {
    if (down) {
      if (!this.touchHeld.has(action)) this.pressed.add(action)
      this.touchHeld.add(action)
    } else {
      this.touchHeld.delete(action)
    }
  }

  snapshot(): InputState {
    const held = new Set<Action>(this.keysHeld.values())
    for (const action of this.touchHeld) held.add(action)

    const aimLength = Math.hypot(this.aimStick.x, this.aimStick.y)
    const aim = aimLength > AIM_DEADZONE ? { x: this.aimStick.x / aimLength, y: this.aimStick.y / aimLength } : null
    if (this.mouseDown || aim) held.add('fire')

    let mx = this.moveStick.x
    let my = this.moveStick.y
    if (held.has('left')) mx -= 1
    if (held.has('right')) mx += 1
    if (held.has('up')) my -= 1
    if (held.has('down')) my += 1
    const moveLength = Math.hypot(mx, my)
    if (moveLength > 1) {
      mx /= moveLength
      my /= moveLength
    }
    if (this.moveStick.x < -0.5) held.add('left')
    if (this.moveStick.x > 0.5) held.add('right')
    if (this.moveStick.y < -0.6) held.add('up')
    if (this.moveStick.y > 0.6) held.add('down')

    return {
      held,
      pressed: new Set(this.pressed),
      move: { x: mx, y: my },
      aim,
      pointer: { ...this.pointer },
    }
  }

  endFrame() {
    this.pressed.clear()
  }

  reset() {
    this.keysHeld.clear()
    this.touchHeld.clear()
    this.pressed.clear()
    this.moveStick = { x: 0, y: 0 }
    this.aimStick = { x: 0, y: 0 }
    this.mouseDown = false
  }
}

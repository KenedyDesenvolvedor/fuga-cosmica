const RECORD_KEY = 'fuga-cosmica:recorde'
const SOUND_KEY = 'fuga-cosmica:som'

export function loadRecord(): number {
  try {
    const value = Number(window.localStorage.getItem(RECORD_KEY))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

export function saveRecord(value: number) {
  try {
    window.localStorage.setItem(RECORD_KEY, String(Math.floor(value)))
  } catch {}
}

export function loadSound(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export function saveSound(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off')
  } catch {}
}

export function formatTime(seconds: number) {
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

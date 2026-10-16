import type { Sfx, SfxName } from './engine/types'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
const lastPlayed = new Map<SfxName, number>()

export function setAudioEnabled(value: boolean) {
  enabled = value
}

export function unlockAudio() {
  if (typeof window === 'undefined') return
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    ctx = new AudioCtor()
    master = ctx.createGain()
    master.gain.value = 0.3
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

interface ToneOptions {
  type?: OscillatorType
  volume?: number
  slideTo?: number
  delay?: number
}

function tone(freq: number, duration: number, { type = 'sine', volume = 0.3, slideTo, delay = 0 }: ToneOptions = {}) {
  if (!ctx || !master) return
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(master)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noise(duration: number, volume: number, cutoff = 1800) {
  if (!ctx || !master) return
  const length = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration)
  const gain = ctx.createGain()
  gain.gain.value = volume
  source.connect(filter).connect(gain).connect(master)
  source.start()
}

const PRESETS: Record<SfxName, () => void> = {
  jump: () => tone(380, 0.14, { type: 'square', volume: 0.08, slideTo: 760 }),
  coin: () => {
    tone(880, 0.1, { type: 'triangle', volume: 0.22 })
    tone(1320, 0.14, { type: 'triangle', volume: 0.18, delay: 0.06 })
  },
  hit: () => {
    noise(0.25, 0.5)
    tone(220, 0.25, { type: 'sawtooth', volume: 0.15, slideTo: 70 })
  },
  shoot: () => {
    tone(620, 0.08, { type: 'square', volume: 0.05, slideTo: 160 })
    noise(0.06, 0.15, 3000)
  },
  explode: () => noise(0.55, 0.6, 1200),
  win: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, { type: 'triangle', volume: 0.2, delay: i * 0.1 }))
  },
  lose: () => tone(330, 0.7, { type: 'sawtooth', volume: 0.15, slideTo: 60 }),
  reload: () => {
    tone(300, 0.05, { type: 'square', volume: 0.08 })
    tone(520, 0.06, { type: 'square', volume: 0.08, delay: 0.14 })
  },
  checkpoint: () => {
    tone(659, 0.12, { type: 'triangle', volume: 0.2 })
    tone(988, 0.2, { type: 'triangle', volume: 0.2, delay: 0.1 })
  },
  alert: () => {
    tone(880, 0.09, { type: 'square', volume: 0.1 })
    tone(1100, 0.12, { type: 'square', volume: 0.1, delay: 0.12 })
  },
  powerup: () => tone(440, 0.3, { type: 'triangle', volume: 0.2, slideTo: 1300 }),
  empty: () => tone(130, 0.05, { type: 'square', volume: 0.08 }),
  click: () => tone(660, 0.05, { type: 'square', volume: 0.08 }),
  nitro: () => {
    noise(0.4, 0.3, 900)
    tone(120, 0.4, { type: 'sawtooth', volume: 0.08, slideTo: 420 })
  },
}

const MIN_GAP: Partial<Record<SfxName, number>> = { shoot: 0.05, coin: 0.04, hit: 0.08, empty: 0.2 }

export const sfx: Sfx = {
  play(name) {
    if (!enabled || !ctx) return
    const now = ctx.currentTime
    const gap = MIN_GAP[name] ?? 0
    if (now - (lastPlayed.get(name) ?? -1) < gap) return
    lastPlayed.set(name, now)
    PRESETS[name]()
  },
}

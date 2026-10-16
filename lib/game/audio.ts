let ctx: AudioContext | null = null
let master: GainNode | null = null

export function unlockAudio() {
  if (typeof window === 'undefined') return
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    ctx = new AudioCtor()
    master = ctx.createGain()
    master.gain.value = 0.35
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(
  freq: number,
  duration: number,
  { type = 'sine', volume = 0.4, slideTo, delay = 0 }: {
    type?: OscillatorType
    volume?: number
    slideTo?: number
    delay?: number
  } = {},
) {
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

function noise(duration: number, volume: number) {
  if (!ctx || !master) return
  const length = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1800, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration)
  const gain = ctx.createGain()
  gain.gain.value = volume
  source.connect(filter).connect(gain).connect(master)
  source.start()
}

export const sfx = {
  star() {
    tone(880, 0.12, { type: 'triangle', volume: 0.35 })
    tone(1320, 0.18, { type: 'triangle', volume: 0.3, delay: 0.06 })
  },
  crash() {
    noise(0.9, 0.9)
    tone(180, 0.6, { type: 'sawtooth', volume: 0.25, slideTo: 40 })
  },
  countdown(final = false) {
    tone(final ? 880 : 520, final ? 0.3 : 0.12, { type: 'square', volume: 0.15 })
  },
  levelUp() {
    tone(523, 0.12, { type: 'triangle', volume: 0.25 })
    tone(659, 0.12, { type: 'triangle', volume: 0.25, delay: 0.1 })
    tone(784, 0.2, { type: 'triangle', volume: 0.25, delay: 0.2 })
  },
  click() {
    tone(660, 0.06, { type: 'square', volume: 0.1 })
  },
}

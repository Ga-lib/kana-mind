// Small feedback sounds synthesised with the Web Audio API: no audio files, works offline.
const KEY = 'kanamind:sound'
let ctx: AudioContext | null = null

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}
export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  if (!soundOn()) return
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx ??= new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  const t = ctx.currentTime + start
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sfx = {
  /** a stroke was accepted */
  tick: () => tone(880, 0, 0.09, 'triangle', 0.12),
  /** a stroke was rejected */
  miss: () => {
    tone(196, 0, 0.16, 'square', 0.07)
    tone(164.8, 0.09, 0.2, 'square', 0.07)
  },
  /** character written correctly */
  pass: () => {
    tone(659.3, 0, 0.18, 'triangle')
    tone(830.6, 0.12, 0.18, 'triangle')
    tone(987.8, 0.24, 0.32, 'triangle')
  },
  /** finished, but with mistakes */
  fail: () => {
    tone(392, 0, 0.2, 'sine', 0.14)
    tone(311.1, 0.18, 0.36, 'sine', 0.14)
  },
}

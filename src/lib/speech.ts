// Free pronunciation using the browser's built-in Japanese text-to-speech voice.
let voice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').startsWith('ja'))
  voice =
    voices.find((v) => /google/i.test(v.name)) ??
    voices.find((v) => /natural|online/i.test(v.name)) ??
    voices[0] ??
    null
}
if (typeof speechSynthesis !== 'undefined') {
  pickVoice()
  speechSynthesis.onvoiceschanged = pickVoice
}

export function hasJapaneseVoice() {
  if (!voice) pickVoice()
  return voice !== null
}

export function speak(text: string, rate = 0.8) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = rate
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
}

// Speech recognition (Chrome / Edge). Returns null where unsupported.
type Rec = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onerror: (e: { error: string }) => void
  onend: () => void
}

export function canListen(): boolean {
  const w = window as unknown as Record<string, unknown>
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function listen(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, new () => Rec>
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return reject(new Error('unsupported'))
    const r = new Ctor()
    r.lang = 'ja-JP'
    r.interimResults = false
    r.maxAlternatives = 5
    let done = false
    r.onresult = (e) => {
      done = true
      const alts = Array.from(e.results[0]).map((a) => a.transcript.trim())
      resolve(alts)
    }
    r.onerror = (e) => {
      done = true
      reject(new Error(e.error))
    }
    r.onend = () => {
      if (!done) resolve([])
    }
    r.start()
  })
}

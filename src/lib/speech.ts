// Free pronunciation using the browser's built-in Japanese text-to-speech voices.
//
// Desktop browsers differ a lot: Chrome offers an online "Google 日本語" voice that sometimes fails
// silently on Windows, Edge has free "Natural" online voices, Firefox only sees voices installed in
// the operating system, and Chrome drops an utterance spoken right after cancel(). So: prefer voices
// installed on the device, wait for the voice list, work around the Chrome bugs, retry with the next
// Japanese voice if one never starts, and report a problem the UI can explain.

export type SpeechProblem = 'unsupported' | 'no-voice' | 'silent'
let voices: SpeechSynthesisVoice[] = []
let broken = new Set<string>() // voices that never started in this session
let lastGood: SpeechSynthesisVoice | null = null

const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

function rank(v: SpeechSynthesisVoice): number {
  if (v.localService) return 0 // installed on this device: most reliable (Windows Haruka/Ayumi/Nanami, macOS Kyoko, phones)
  if (/natural|online/i.test(v.name)) return 1 // Edge's free neural voices
  return 2 // Chrome's Google network voice and anything else
}

function refreshVoices() {
  if (!supported()) return
  voices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'))
    .sort((a, b) => rank(a) - rank(b))
}
if (supported()) {
  refreshVoices()
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

/** The voice list loads asynchronously in Chrome and Edge; wait for it briefly. */
function voicesReady(): Promise<void> {
  refreshVoices()
  if (voices.length || !supported()) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      refreshVoices()
      resolve()
    }
    speechSynthesis.addEventListener?.('voiceschanged', done, { once: true })
    setTimeout(done, 1200)
  })
}

export function hasJapaneseVoice() {
  refreshVoices()
  return voices.length > 0
}

export function japaneseVoices(): { name: string; local: boolean }[] {
  refreshVoices()
  return voices.map((v) => ({ name: v.name, local: v.localService }))
}

export function currentVoiceName(): string | null {
  return lastGood?.name ?? voices.find((v) => !broken.has(v.name))?.name ?? null
}

function report(problem: SpeechProblem) {
  window.dispatchEvent(new CustomEvent<SpeechProblem>('kanamind:speech-problem', { detail: problem }))
}

let token = 0
let warnedNoVoice = false
function attempt(text: string, rate: number, voice: SpeechSynthesisVoice | null, id: number, tried: Set<string>) {
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = rate
  if (voice) u.voice = voice
  let started = false
  u.onstart = () => {
    started = true
    if (voice) lastGood = voice
  }
  u.onerror = (e) => {
    if (e.error === 'interrupted' || e.error === 'canceled') return
    if (!started) next()
  }
  // Watchdog: some voices accept the utterance but never start.
  const timer = setTimeout(() => {
    if (!started && id === token) next()
  }, 1800)
  u.onend = () => clearTimeout(timer)
  function next() {
    clearTimeout(timer)
    if (id !== token) return
    if (voice) {
      broken.add(voice.name)
      tried.add(voice.name)
    }
    const alt = voices.find((v) => !tried.has(v.name) && !broken.has(v.name))
    speechSynthesis.cancel()
    if (alt) setTimeout(() => attempt(text, rate, alt, id, tried), 60)
    else report(voices.length ? 'silent' : 'no-voice')
  }
  speechSynthesis.speak(u)
}

export function speak(text: string, rate = 0.8) {
  if (!supported()) return report('unsupported')
  const id = ++token
  void voicesReady().then(() => {
    if (id !== token) return
    speechSynthesis.cancel()
    speechSynthesis.resume() // Chrome can leave the engine paused after a long idle
    const first = (lastGood && !broken.has(lastGood.name) ? lastGood : null) ?? voices.find((v) => !broken.has(v.name)) ?? null
    if (!first && voices.length === 0) {
      // No Japanese voice at all: the browser would fall back to a non-Japanese voice that is silent or
      // mispronounces. Still try (some browsers route lang=ja-JP), but explain the fix once per visit.
      if (!warnedNoVoice) {
        warnedNoVoice = true
        report('no-voice')
      }
      setTimeout(() => attempt(text, rate, null, id, new Set()), 60)
      return
    }
    // Chrome drops an utterance spoken in the same tick as cancel(); give it a moment.
    setTimeout(() => attempt(text, rate, first, id, new Set()), 60)
  })
}

/** Forget voices marked broken (e.g. after the learner installs a Japanese voice). */
export function resetVoices() {
  broken = new Set()
  lastGood = null
  warnedNoVoice = false
  refreshVoices()
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

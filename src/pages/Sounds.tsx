import { useEffect, useState } from 'react'
import { hasJapaneseVoice, speak } from '../lib/speech'

const VOWELS: [string, string, string][] = [
  ['あ', 'a', 'like "a" in "father", mouth open'],
  ['い', 'i', 'like "ee" in "meet", but short'],
  ['う', 'u', 'like "oo" in "food", lips NOT rounded'],
  ['え', 'e', 'like "e" in "bed"'],
  ['お', 'o', 'like "o" in "go", but pure, no "w" at the end'],
]

const PAIRS: { title: string; note: string; words: [string, string, string][] }[] = [
  {
    title: 'Long vowels change the meaning',
    note: 'Hold a long vowel for two beats. Clap once per beat (mora) while you say it.',
    words: [
      ['おばさん', 'obasan', 'aunt'],
      ['おばあさん', 'obaasan', 'grandmother'],
      ['おじさん', 'ojisan', 'uncle'],
      ['おじいさん', 'ojiisan', 'grandfather'],
    ],
  },
  {
    title: 'Small っ = a tiny pause',
    note: 'The small tsu doubles the next consonant: stop for one beat as if holding your breath.',
    words: [
      ['きて', 'kite', 'come (please)'],
      ['きって', 'kitte', 'postage stamp'],
      ['さか', 'saka', 'slope'],
      ['さっか', 'sakka', 'author'],
    ],
  },
  {
    title: 'Big vs small ゃゅょ',
    note: 'A small ゃゅょ blends into one beat. A big one is its own separate beat.',
    words: [
      ['びょういん', 'byouin', 'hospital'],
      ['びよういん', 'biyouin', 'beauty salon'],
      ['きよう', 'kiyou', 'skilful'],
      ['きょう', 'kyou', 'today'],
    ],
  },
  {
    title: 'ん is a full beat',
    note: 'ん gets its own beat. こんにちは has five beats: こ・ん・に・ち・は.',
    words: [
      ['こんにちは', 'konnichiwa', 'hello'],
      ['きんえん', 'kin’en', 'no smoking'],
      ['せんせい', 'sensei', 'teacher'],
    ],
  },
]

const PARTICLES: [string, string, string][] = [
  ['は', 'wa', 'Topic marker: わたしは (watashi wa) = "as for me"'],
  ['へ', 'e', 'Direction: にほんへ (nihon e) = "to Japan"'],
  ['を', 'o', 'Object marker: みずをのむ (mizu o nomu) = "drink water"'],
]

export default function Sounds() {
  const [noVoice, setNoVoice] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setNoVoice(!hasJapaneseVoice()), 1500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="page narrow">
      <h1>Pronunciation</h1>
      {noVoice && (
        <div className="tip warn">
          Your browser didn’t report a Japanese voice yet. Audio may sound wrong. On Windows add “Japanese” under
          Settings → Time & language → Speech; on Android/iOS install the Japanese TTS voice. Chrome and Edge include one.
        </div>
      )}
      <div className="card">
        <h3>Only five vowels, always the same</h3>
        <p className="muted small-text">Every Japanese sound is built on these. Unlike English, they never change.</p>
        <div className="vowels">
          {VOWELS.map(([c, r, d]) => (
            <button key={c} className="vowel" onClick={() => speak(c)}>
              <span className="lc hiragana">{c}</span>
              <b>{r}</b>
              <span className="small-text muted">{d}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>The tricky ones</h3>
        <ul className="tricky">
          <li><button className="chip" onClick={() => speak('ふじさん')}>ふ fu 🔊</button> Blow gently like cooling soup; the lips stay apart.</li>
          <li><button className="chip" onClick={() => speak('つなみ')}>つ tsu 🔊</button> The "ts" at the end of "cats", then a short u.</li>
          <li><button className="chip" onClick={() => speak('らりるれろ')}>ら行 r 🔊</button> A quick tap of the tongue behind the teeth, like the "tt" in American "butter".</li>
          <li><button className="chip" onClick={() => speak('です')}>です desu 🔊</button> The final u is almost silent: "dess".</li>
          <li><button className="chip" onClick={() => speak('しちじ')}>し shi, ち chi 🔊</button> Never "si" or "ti".</li>
        </ul>
      </div>

      {PAIRS.map((p) => (
        <div key={p.title} className="card">
          <h3>{p.title}</h3>
          <p className="muted small-text">{p.note}</p>
          <div className="pairs">
            {p.words.map(([w, r, m]) => (
              <button key={w} className="example" onClick={() => speak(w, 0.7)}>
                <span className="ex-w">{w}</span>
                <span className="ex-r">{r}</span>
                <span className="ex-m">{m}</span>
                <span>🔊</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="card">
        <h3>Particles that break the rules</h3>
        {PARTICLES.map(([c, r, d]) => (
          <div key={c} className="particle">
            <span className="lc hiragana">{c}</span>
            <span>read <b>{r}</b> — {d}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Rhythm, not stress</h3>
        <p className="small-text">
          Japanese is timed in even beats called <b>mora</b>. Each kana (including ん, っ and a long vowel) gets one beat. Words use
          high and low pitch instead of loud and soft stress, so keep your volume even and let the pitch rise and fall. Listen
          to the 🔊 examples and copy the melody, not just the sounds.
        </p>
      </div>
    </div>
  )
}

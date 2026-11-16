import { useState } from 'react'
import { BY_CHAR, LOOKALIKES } from '../data'
import { speak } from '../lib/speech'
import { record } from '../lib/store'
import { shuffle } from '../lib/util'

function Drill({ onExit }: { onExit: () => void }) {
  const make = () => {
    const g = LOOKALIKES[Math.floor(Math.random() * LOOKALIKES.length)]
    const target = g.chars[Math.floor(Math.random() * g.chars.length)]
    return { g, target, opts: shuffle(g.chars) }
  }
  const [q, setQ] = useState(make)
  const [pick, setPick] = useState<string | null>(null)
  const [score, setScore] = useState({ r: 0, n: 0 })
  const item = BY_CHAR.get(q.target)!

  const choose = (c: string) => {
    if (pick) return
    setPick(c)
    const ok = c === q.target
    record(item.id, ok)
    setScore((s) => ({ r: s.r + (ok ? 1 : 0), n: s.n + 1 }))
    speak(item.speak)
  }

  return (
    <div className="card quiz">
      <div className="quiz-top">
        <button className="btn small ghost-btn" onClick={onExit}>✕ Stop</button>
        <span className="muted">{score.r}/{score.n}</span>
      </div>
      <div className="q-label">Which one is…</div>
      <div className="q-prompt romaji-prompt">
        {item.romaji} <button className="icon-btn" onClick={() => speak(item.speak)}>🔊</button>
      </div>
      <div className="options char-opts">
        {q.opts.map((c) => (
          <button
            key={c}
            className={`opt ${pick ? (c === q.target ? 'right' : c === pick ? 'wrong' : 'dim') : ''}`}
            onClick={() => choose(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {pick && (
        <div className="feedback">
          <div className="tip">{q.g.hint}</div>
          <button className="btn accent" onClick={() => { setQ(make()); setPick(null) }}>Next →</button>
        </div>
      )}
    </div>
  )
}

export default function Lookalikes() {
  const [drill, setDrill] = useState(false)
  if (drill)
    return (
      <div className="page narrow">
        <Drill onExit={() => setDrill(false)} />
      </div>
    )
  return (
    <div className="page">
      <h1>Look-alikes</h1>
      <p className="muted">These are the pairs that trip everyone up. Learn the one difference that tells them apart, then drill them.</p>
      <button className="btn accent big" onClick={() => setDrill(true)}>Start look-alike drill 👯</button>
      <div className="look-grid">
        {LOOKALIKES.map((g) => (
          <div key={g.chars.join()} className="card look">
            <div className="look-chars">
              {g.chars.map((c) => {
                const it = BY_CHAR.get(c)!
                return (
                  <button key={c} className="look-char" onClick={() => speak(it.speak)}>
                    <span className="lc">{c}</span>
                    <span className="muted">{it.romaji} {it.emoji}</span>
                  </button>
                )
              })}
            </div>
            <p className="small-text">{g.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

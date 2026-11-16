import { useState } from 'react'
import { BY_CHAR, LOOKALIKES } from '../data'
import { speak } from '../lib/speech'
import { record } from '../lib/store'
import { shuffle } from '../lib/util'
import Icon from '../components/Icon'

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
    <div className="panel quiz">
      <div className="quiz-top">
        <button className="btn small quiet" onClick={onExit}>
          <Icon name="close" size={16} /> Stop
        </button>
        <span className="muted tnum">{score.r} of {score.n} right</span>
      </div>
      <p className="q-label">Which one is this?</p>
      <div className="q-prompt romaji-prompt" key={q.target + score.n}>
        {item.romaji}
        <button className="icon-btn" aria-label="Play the sound" onClick={() => speak(item.speak)}>
          <Icon name="speaker" size={26} />
        </button>
      </div>
      <div className="options char-opts">
        {q.opts.map((c) => (
          <button
            key={c}
            className={`opt square-opt ${pick ? (c === q.target ? 'right' : c === pick ? 'wrong' : 'dim') : ''}`}
            onClick={() => choose(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {pick && (
        <div className="feedback">
          <div className="tip">
            <Icon name="eye" size={20} />
            <p>{q.g.hint}</p>
          </div>
          <button className="btn primary" onClick={() => { setQ(make()); setPick(null) }}>Next pair</button>
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
      <div className="page-head">
        <h1>Look-alikes</h1>
        <button className="btn primary" onClick={() => setDrill(true)}>
          <Icon name="twins" size={18} /> Start the drill
        </button>
      </div>
      <p className="muted intro">These sets trip everyone up. Learn the one difference that tells them apart, then drill them.</p>
      <div className="look-grid">
        {LOOKALIKES.map((g) => (
          <div key={g.chars.join()} className="panel look">
            <div className="look-chars">
              {g.chars.map((c) => {
                const it = BY_CHAR.get(c)!
                return (
                  <button key={c} className="look-char" onClick={() => speak(it.speak)} aria-label={`${c}, ${it.romaji}. Play sound`}>
                    <span className="lc square">{c}</span>
                    <span className="muted">{it.romaji} {it.picture}</span>
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

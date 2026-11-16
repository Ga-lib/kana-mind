import { useMemo, useState } from 'react'
import { ALL, BY_ID } from '../data'
import Quiz from '../components/Quiz'
import { dueIds, useStore } from '../lib/store'

function fmt(ms: number) {
  const m = Math.round(ms / 60000)
  if (m < 60) return `${Math.max(1, m)} min`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} h`
  return `${Math.round(h / 24)} days`
}

export default function Review() {
  const { cards } = useStore()
  const [started, setStarted] = useState<string[] | null>(null)
  const due = useMemo(() => dueIds(ALL.map((i) => i.id)), [cards, started])
  const upcoming = Object.values(cards).map((c) => c.due).filter((d) => d > Date.now()).sort((a, b) => a - b)[0]

  if (started)
    return (
      <div className="page narrow">
        <Quiz
          items={started.map((id) => BY_ID.get(id)!)}
          modes={['pick-romaji', 'pick-char', 'listen', 'type-romaji', 'reading']}
          title="Spaced review"
          onExit={() => setStarted(null)}
        />
      </div>
    )

  const boxes = [1, 2, 3, 4, 5, 6].map((b) => Object.values(cards).filter((c) => c.box === b).length)
  return (
    <div className="page narrow">
      <h1>Spaced review</h1>
      <div className="card center-text">
        {due.length ? (
          <>
            <div className="due-num">{due.length}</div>
            <p>characters are ready to review. Reviewing right before you forget is what makes memories last.</p>
            <button className="btn accent big" onClick={() => setStarted(due.slice(0, 50))}>
              Start review {due.length > 50 ? '(first 50)' : ''}
            </button>
          </>
        ) : Object.keys(cards).length ? (
          <>
            <div className="due-num">✓</div>
            <p>All caught up! {upcoming ? `Next review in ${fmt(upcoming - Date.now())}.` : ''}</p>
            <a className="btn accent" href="#/learn/hiragana">Learn something new</a>
          </>
        ) : (
          <>
            <div className="due-num">🌱</div>
            <p>Nothing to review yet. Do a lesson or quiz and the characters you meet will show up here on a schedule.</p>
            <a className="btn accent" href="#/learn/hiragana">Start with Hiragana</a>
          </>
        )}
      </div>

      <div className="card">
        <h3>Your memory boxes</h3>
        <p className="muted small-text">Right answers move a card one box up (seen again later); a miss sends it back to box 1.</p>
        <div className="boxes">
          {boxes.map((n, i) => (
            <div key={i} className="box">
              <div className="box-bar" style={{ height: `${Math.min(100, n * 3 + 4)}%` }} />
              <b>{n}</b>
              <span className="muted small-text">{['1 min', '1 day', '3 days', '1 wk', '2 wks', '5 wks'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

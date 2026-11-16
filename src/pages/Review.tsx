import { useMemo, useState } from 'react'
import { ALL, BY_ID } from '../data'
import Quiz from '../components/Quiz'
import Icon from '../components/Icon'
import { dueIds, useStore } from '../lib/store'

function fmt(ms: number) {
  const m = Math.round(ms / 60000)
  if (m < 60) return `${Math.max(1, m)} min`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} hours`
  return `${Math.round(h / 24)} days`
}

const GAPS = ['1 min', '1 day', '3 days', '1 week', '2 weeks', '5 weeks']

export default function Review() {
  const { cards } = useStore()
  const [started, setStarted] = useState<string[] | null>(null)
  const due = useMemo(() => dueIds(ALL.map((i) => i.id)), [cards, started])
  const upcoming = Object.values(cards).map((c) => c.due).filter((d) => d > Date.now()).sort((a, b) => a - b)[0]

  if (started)
    return (
      <div className="page narrow">
        <Quiz
          items={started.map((id) => BY_ID.get(id)!).filter(Boolean)}
          modes={['pick-romaji', 'pick-char', 'listen', 'type-romaji', 'reading']}
          title="Spaced review"
          onExit={() => setStarted(null)}
        />
      </div>
    )

  const boxes = [1, 2, 3, 4, 5, 6].map((b) => Object.values(cards).filter((c) => c.box === b).length)
  const maxBox = Math.max(1, ...boxes)
  return (
    <div className="page narrow">
      <h1>Review</h1>
      <div className="panel review-state">
        {due.length ? (
          <>
            <div className="due-num tnum">{due.length}</div>
            <p>{due.length === 1 ? 'character is' : 'characters are'} ready. Reviewing right before you forget is what makes a memory last.</p>
            <button className="btn primary big" onClick={() => setStarted(due.slice(0, 50))}>
              Start review{due.length > 50 ? ' (first 50)' : ''}
            </button>
          </>
        ) : Object.keys(cards).length ? (
          <>
            <span className="state-icon good"><Icon name="check" size={40} /></span>
            <p>All caught up.{upcoming ? ` The next review opens in ${fmt(upcoming - Date.now())}.` : ''}</p>
            <a className="btn primary" href="#/learn/hiragana">Learn something new</a>
          </>
        ) : (
          <>
            <span className="state-icon"><Icon name="sprout" size={40} /></span>
            <p>Nothing to review yet. Characters you meet in lessons and quizzes show up here on a schedule.</p>
            <a className="btn primary" href="#/learn/hiragana">Start with hiragana</a>
          </>
        )}
      </div>

      <div className="panel">
        <h2>Memory boxes</h2>
        <p className="muted small-text">A right answer moves a character up one box, so you see it less often. A miss sends it back to box 1.</p>
        <div className="boxes">
          {boxes.map((n, i) => (
            <div key={i} className="box">
              <b className="tnum">{n}</b>
              <div className="box-bar" style={{ height: `${8 + (n / maxBox) * 92}%` }} />
              <span className="muted small-text">{GAPS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

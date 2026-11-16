import { useState } from 'react'
import { groupsOf, itemsOf, type Item, type Script } from '../data'
import CharDetail, { MnemonicCard } from '../components/CharDetail'
import Quiz from '../components/Quiz'
import StrokeOrder from '../components/StrokeOrder'
import { speak } from '../lib/speech'
import { useStore } from '../lib/store'

const TABS: [Script, string, string][] = [
  ['hiragana', 'Hiragana', 'ひらがな'],
  ['katakana', 'Katakana', 'カタカナ'],
  ['kanji', 'Kanji', '漢字'],
]

function Lesson({ items, onQuiz, onClose }: { items: Item[]; onQuiz: () => void; onClose: () => void }) {
  const [i, setI] = useState(0)
  const it = items[i]
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet lesson" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <span className="muted">Lesson · {i + 1} of {items.length}</span>
          <button className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="progress"><div style={{ width: `${((i + 1) / items.length) * 100}%` }} /></div>
        <div className="lesson-body" key={it.id}>
          <MnemonicCard item={it} />
          {it.tip && <div className="tip"><b>👄 How to say it:</b> {it.tip}</div>}
          {it.examples && (
            <div className="row gap-s wrap center">
              {it.examples.map((e) => (
                <button key={e.w} className="chip" onClick={() => speak(e.r)}>{e.w} · {e.r} · {e.m} 🔊</button>
              ))}
            </div>
          )}
          <StrokeOrder char={it.char} size={160} />
          <p className="muted small-text center-text">Close your eyes and picture the image for 3 seconds, then say “{it.script === 'kanji' ? it.examples?.[0].r : it.char}” out loud.</p>
        </div>
        <div className="row gap-s center">
          <button className="btn ghost-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
          {i < items.length - 1 ? (
            <button className="btn accent" onClick={() => { setI(i + 1); speak(items[i + 1].speak) }}>Next →</button>
          ) : (
            <button className="btn accent" onClick={onQuiz}>Quiz me on these 🎯</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Learn({ script }: { script: Script }) {
  const items = itemsOf(script)
  const groups = groupsOf(script)
  const { cards } = useStore()
  const [open, setOpen] = useState<number | null>(null)
  const [lesson, setLesson] = useState<Item[] | null>(null)
  const [quiz, setQuiz] = useState<{ items: Item[]; title: string } | null>(null)

  if (quiz)
    return (
      <div className="page narrow">
        <Quiz
          items={quiz.items}
          title={quiz.title}
          modes={script === 'kanji' ? ['pick-romaji', 'pick-char', 'reading'] : ['pick-romaji', 'pick-char', 'listen', 'type-romaji']}
          onExit={() => setQuiz(null)}
        />
      </div>
    )

  return (
    <div className="page">
      <div className="script-tabs">
        {TABS.map(([k, name, jp]) => (
          <a key={k} href={`#/learn/${k}`} className={k === script ? 'on' : ''}>
            {name} <span className="jp">{jp}</span>
          </a>
        ))}
      </div>
      <p className="muted center-text">
        Tap any character for its picture story, audio, stroke order and writing pad. Or press ▶ Lesson to learn a row step by step.
      </p>

      {groups.map((g) => {
        const gi = items.filter((i) => i.group === g.key)
        if (!gi.length) return null
        return (
          <section key={g.key} className="group">
            <div className="group-head">
              <h2>{g.label}</h2>
              <div className="row gap-s">
                <button className="btn small" onClick={() => { setLesson(gi); speak(gi[0].speak) }}>▶ Lesson</button>
                <button className="btn small accent" onClick={() => setQuiz({ items: gi, title: g.label })}>🎯 Quiz</button>
              </div>
            </div>
            <div className={`tiles ${script} ${g.key === 'combo' ? 'wide' : ''}`}>
              {gi.map((it) => {
                const c = cards[it.id]
                const lvl = c ? (c.box >= 5 ? 'm' : c.box >= 2 ? 'l' : 's') : ''
                return (
                  <button key={it.id} className={`tile lvl-${lvl}`} onClick={() => setOpen(items.indexOf(it))}>
                    <span className="tile-emoji">{it.emoji}</span>
                    <span className={`tile-char ${script}`}>{it.char}</span>
                    <span className="tile-romaji">{script === 'kanji' ? it.meaning : it.romaji}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="legend small-text muted">
        <span><i className="dot s" /> seen</span>
        <span><i className="dot l" /> learning</span>
        <span><i className="dot m" /> mastered</span>
      </div>

      {open !== null && (
        <CharDetail
          item={items[open]}
          onClose={() => setOpen(null)}
          onPrev={open > 0 ? () => setOpen(open - 1) : undefined}
          onNext={open < items.length - 1 ? () => setOpen(open + 1) : undefined}
        />
      )}
      {lesson && (
        <Lesson
          items={lesson}
          onClose={() => setLesson(null)}
          onQuiz={() => {
            setQuiz({ items: lesson, title: 'Lesson quiz' })
            setLesson(null)
          }}
        />
      )}
    </div>
  )
}

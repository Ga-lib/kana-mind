import { useState } from 'react'
import { groupsOf, itemsOf, type Item, type Script } from '../data'
import CharDetail, { MnemonicCard } from '../components/CharDetail'
import Quiz from '../components/Quiz'
import StrokeOrder from '../components/StrokeOrder'
import Icon from '../components/Icon'
import Art from '../components/Art'
import type { Level } from '../data'
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
      <div className="sheet lesson" role="dialog" aria-modal="true" aria-label="Lesson" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <span className="muted tnum">Lesson, {i + 1} of {items.length}</span>
          <button className="icon-btn close" onClick={onClose} aria-label="Close lesson">
            <Icon name="close" />
          </button>
        </div>
        <div className="progress"><div style={{ width: `${((i + 1) / items.length) * 100}%` }} /></div>
        <div className="lesson-body" key={it.id}>
          <MnemonicCard item={it} />
          {it.tip && (
            <div className="tip">
              <Icon name="lips" size={20} />
              <p><b>How to say it.</b> {it.tip}</p>
            </div>
          )}
          {it.examples && (
            <div className="row gap-s wrap center">
              {it.examples.map((e) => (
                <button key={e.w} className="chip" onClick={() => speak(e.r)}>
                  <span className="jp">{e.w}</span> <span className="muted">{e.r}, {e.m}</span> <Icon name="speaker" size={15} />
                </button>
              ))}
            </div>
          )}
          <StrokeOrder char={it.char} size={170} />
          <p className="muted small-text center-text">
            Close your eyes, picture the scene for three seconds, then say “{it.script === 'kanji' ? it.examples?.[0].r : it.char}” out loud.
          </p>
        </div>
        <div className="row gap-s center">
          <button className="btn quiet" disabled={i === 0} onClick={() => setI(i - 1)}>
            <Icon name="left" size={16} /> Back
          </button>
          {i < items.length - 1 ? (
            <button className="btn primary" onClick={() => { setI(i + 1); speak(items[i + 1].speak) }}>
              Next <Icon name="right" size={16} />
            </button>
          ) : (
            <button className="btn primary" onClick={onQuiz}>
              <Icon name="target" size={16} /> Quiz me on these
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Learn({ script }: { script: Script }) {
  const items = itemsOf(script)
  const [level, setLevel] = useState<Level>('n5')
  const groups = groupsOf(script).filter((g) => script !== 'kanji' || g.level === level)
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
      <div className="page-head">
        <h1>Learn</h1>
        <div className="seg script-tabs" role="tablist" aria-label="Script">
          {TABS.map(([k, name, jp]) => (
            <a key={k} role="tab" aria-selected={k === script} href={`#/learn/${k}`} className={k === script ? 'on' : ''}>
              {name} <span className="jp">{jp}</span>
            </a>
          ))}
        </div>
      </div>
      {script === 'kanji' && (
        <div className="seg level-tabs" role="tablist" aria-label="JLPT level">
          {(['n5', 'n4', 'n3'] as Level[]).map((l) => (
            <button key={l} role="tab" aria-selected={level === l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>
              {l.toUpperCase()} <span className="muted">{items.filter((i) => groupsOf(script).find((g) => g.key === i.group)?.level === l).length}</span>
            </button>
          ))}
        </div>
      )}
      <p className="muted intro">
        Open any character for its picture story, sound, strokes and practice pad, or start a lesson to go through a row one
        character at a time.
      </p>

      {groups.map((g) => {
        const gi = items.filter((i) => i.group === g.key)
        if (!gi.length) return null
        return (
          <section key={g.key} className="group">
            <div className="group-head">
              <h2>{g.label}</h2>
              <div className="row gap-s">
                <button className="btn small" onClick={() => { setLesson(gi); speak(gi[0].speak) }}>
                  <Icon name="play" size={15} /> Lesson
                </button>
                <button className="btn small primary" onClick={() => setQuiz({ items: gi, title: g.label })}>
                  <Icon name="target" size={15} /> Quiz
                </button>
              </div>
            </div>
            <div className={`tiles ${script} ${g.key === 'combo' ? 'wide' : ''}`}>
              {gi.map((it) => {
                const c = cards[it.id]
                const lvl = c ? (c.box >= 5 ? 'm' : c.box >= 2 ? 'l' : 's') : 'n'
                return (
                  <button
                    key={it.id}
                    className={`tile lvl-${lvl}`}
                    onClick={() => setOpen(items.indexOf(it))}
                    aria-label={`${it.char}, ${script === 'kanji' ? it.meaning : it.romaji}`}
                  >
                    <span className="tile-picture" aria-hidden>{it.art ? <Art id={it.art} size={18} /> : it.picture}</span>
                    <span className={`tile-char ${script}`} aria-hidden>{it.char}</span>
                    <span className="tile-romaji">{script === 'kanji' ? it.meaning : it.romaji}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="legend small-text muted">
        <span><i className="dot s" /> Seen</span>
        <span><i className="dot l" /> Learning</span>
        <span><i className="dot m" /> Mastered</span>
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

import { useEffect, useMemo, useState } from 'react'
import type { Level } from '../data'
import { loadVocab, type Word } from '../lib/vocab'
import { speak } from '../lib/speech'
import { sample, shuffle } from '../lib/util'
import Icon from '../components/Icon'
import Art from '../components/Art'

const LEVELS: Level[] = ['n5', 'n4', 'n3']
const PAGE = 48

function WordCard({ w }: { w: Word }) {
  return (
    <article className="word panel">
      <div className="word-top">
        <div className="word-pic">{w.art ? <Art id={w.art} size={84} label={w.meaning} /> : <span className="word-glyph jp" aria-hidden>{[...w.word][0]}</span>}</div>
        <div className="word-main">
          <h3 className="word-head jp">{w.word}</h3>
          <p className="word-meaning">{w.meaning}</p>
        </div>
      </div>
      <dl className="word-forms">
        <div><dt>Kanji</dt><dd className="jp">{w.hasKanji ? w.word : <span className="muted">none</span>}</dd></div>
        <div><dt>Hiragana</dt><dd className="jp">{w.hiragana}</dd></div>
        <div><dt>Katakana</dt><dd className="jp">{w.katakana}</dd></div>
        <div><dt>Romaji</dt><dd>{w.romaji}</dd></div>
      </dl>
      <div className="row gap-s">
        <button className="btn small primary" onClick={() => speak(w.reading)}>
          <Icon name="speaker" size={15} /> Listen
        </button>
        <button className="btn small quiet" onClick={() => speak(w.reading, 0.5)}>
          <Icon name="slow" size={15} /> Slowly
        </button>
      </div>
    </article>
  )
}

function WordQuiz({ words, onExit }: { words: Word[]; onExit: () => void }) {
  const [qs] = useState(() => sample(words, Math.min(15, words.length)))
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [listen, setListen] = useState(false)
  const q = qs[i]
  const options = useMemo(
    () => (q ? shuffle([q.meaning, ...sample(words.filter((w) => w.meaning !== q.meaning), 3).map((w) => w.meaning)]) : []),
    [q, words],
  )
  useEffect(() => {
    if (q && listen) speak(q.reading)
  }, [q, listen])

  if (!q)
    return (
      <div className="panel quiz center-text">
        <h2 className="result-title">{score} of {qs.length} right</h2>
        <p className="muted">Words you missed are worth reading aloud again in the list.</p>
        <button className="btn primary" onClick={onExit}>Back to the word list</button>
      </div>
    )

  const choose = (o: string) => {
    if (pick) return
    setPick(o)
    if (o === q.meaning) setScore((s) => s + 1)
    speak(q.reading)
  }
  return (
    <div className="panel quiz">
      <div className="quiz-top">
        <button className="btn small quiet" onClick={onExit}><Icon name="close" size={16} /> Quit</button>
        <button className="btn small quiet" aria-pressed={listen} onClick={() => setListen((l) => !l)}>
          <Icon name={listen ? 'eye' : 'speaker'} size={15} /> {listen ? 'Show the word' : 'Listening mode'}
        </button>
        <span className="muted tnum">{i + 1} of {qs.length}</span>
      </div>
      <div className="progress"><div style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <p className="q-label">What does this mean?</p>
      <div className="word-prompt" key={q.id}>
        {listen && !pick ? (
          <button className="listen-btn" aria-label="Play the word again" onClick={() => speak(q.reading)}><Icon name="speaker" size={44} /></button>
        ) : (
          <>
            <span className="jp word-prompt-w">{q.word}</span>
            <span className="word-prompt-r"><span className="jp">{q.hiragana}</span><span className="muted">{q.romaji}</span></span>
          </>
        )}
      </div>
      <div className="options">
        {options.map((o, k) => (
          <button key={o + k} className={`opt ${pick ? (o === q.meaning ? 'right' : o === pick ? 'wrong' : 'dim') : ''}`} onClick={() => choose(o)}>
            <span className="key">{k + 1}</span>{o}
          </button>
        ))}
      </div>
      {pick && (
        <div className="feedback">
          {q.art && <div className="center-text"><Art id={q.art} size={88} label={q.meaning} /></div>}
          <button className="btn primary" onClick={() => { setPick(null); setI(i + 1) }}>Next</button>
        </div>
      )}
    </div>
  )
}

export default function Words() {
  const [level, setLevel] = useState<Level>('n5')
  const [words, setWords] = useState<Word[] | null>(null)
  const [query, setQuery] = useState('')
  const [onlyPics, setOnlyPics] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [quiz, setQuiz] = useState(false)

  useEffect(() => {
    let alive = true
    setWords(null)
    setShown(PAGE)
    loadVocab(level).then((w) => alive && setWords(w))
    return () => {
      alive = false
    }
  }, [level])

  const filtered = useMemo(() => {
    if (!words) return []
    const q = query.trim().toLowerCase().slice(0, 40)
    return words.filter(
      (w) =>
        (!onlyPics || w.art) &&
        (!q || w.word.includes(q) || w.hiragana.includes(q) || w.katakana.includes(q) || w.romaji.includes(q.replace(/\s/g, '')) || w.meaning.toLowerCase().includes(q)),
    )
  }, [words, query, onlyPics])

  if (quiz && filtered.length >= 4)
    return (
      <div className="page narrow">
        <WordQuiz words={filtered} onExit={() => setQuiz(false)} />
      </div>
    )

  return (
    <div className="page">
      <div className="page-head">
        <h1>Vocabulary</h1>
        <div className="seg" role="tablist" aria-label="JLPT level">
          {LEVELS.map((l) => (
            <button key={l} role="tab" aria-selected={level === l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="muted intro">
        The words each JLPT level expects you to know, with every way to write them, the sound, and a picture where one helps. Say
        each word out loud as you read it.
      </p>

      <div className="word-tools">
        <label className="search">
          <span className="sr-only">Search words</span>
          <input
            type="search"
            value={query}
            maxLength={40}
            placeholder="Search in English, kana or romaji"
            onChange={(e) => { setQuery(e.target.value); setShown(PAGE) }}
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={onlyPics} onChange={(e) => { setOnlyPics(e.target.checked); setShown(PAGE) }} />
          Only words with pictures
        </label>
        <button className="btn primary" disabled={filtered.length < 4} onClick={() => setQuiz(true)}>
          <Icon name="target" size={16} /> Quiz me on these
        </button>
      </div>

      {!words ? (
        <p className="muted center-text">Loading words</p>
      ) : (
        <>
          <p className="muted small-text tnum">{filtered.length} {filtered.length === 1 ? 'word' : 'words'}</p>
          {filtered.length === 0 && <p className="center-text">No words match “{query}”. Try a shorter search or another level.</p>}
          <div className="word-grid">
            {filtered.slice(0, shown).map((w) => (
              <WordCard key={w.id} w={w} />
            ))}
          </div>
          {shown < filtered.length && (
            <div className="row center">
              <button className="btn" onClick={() => setShown((s) => s + PAGE)}>
                Show more ({filtered.length - shown} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

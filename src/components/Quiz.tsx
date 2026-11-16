import { useEffect, useMemo, useRef, useState } from 'react'
import { itemsOf, LOOKALIKES, type Item } from '../data'
import { speak } from '../lib/speech'
import { record } from '../lib/store'
import { sample, shuffle } from '../lib/util'
import { MnemonicCard } from './CharDetail'

export type Mode = 'pick-romaji' | 'type-romaji' | 'pick-char' | 'listen' | 'reading'

export const MODE_LABEL: Record<Mode, string> = {
  'pick-romaji': 'See → choose sound',
  'type-romaji': 'See → type sound',
  'pick-char': 'Sound → choose character',
  listen: 'Hear → choose character',
  reading: 'Kanji word → choose reading',
}

interface Q {
  item: Item
  mode: Mode
  prompt: string
  options: string[]
  answer: string
  exampleIdx?: number
}

const lookalikeOf = new Map<string, string[]>()
LOOKALIKES.forEach((g) => g.chars.forEach((c) => lookalikeOf.set(c, g.chars.filter((x) => x !== c))))

// Accept common alternative romanisations (Kunrei/Nihon-shiki) when typing.
const ALT: [RegExp, string][] = [
  [/^si/, 'shi'], [/^ti/, 'chi'], [/^tu$/, 'tsu'], [/^hu$/, 'fu'], [/^(zi|di)$/, 'ji'], [/^du$/, 'zu'],
  [/^sy/, 'sh'], [/^ty/, 'ch'], [/^cy/, 'ch'], [/^(zy|jy)/, 'j'], [/^wo$/, 'o'], [/^nn$/, 'n'],
]
function norm(s: string) {
  let x = s.trim().toLowerCase()
  for (const [re, to] of ALT) x = x.replace(re, to)
  return x.replace(/^shii/, 'shi').replace(/^chii/, 'chi')
}

function label(it: Item) {
  return it.script === 'kanji' ? it.meaning! : it.romaji
}

function makeQ(item: Item, modes: Mode[]): Q {
  let usable = modes.filter((m) => !(m === 'type-romaji' && item.script === 'kanji') && !(m === 'reading' && !item.examples))
  if (!usable.length) usable = ['pick-romaji']
  const mode = usable[Math.floor(Math.random() * usable.length)]
  const pool = itemsOf(item.script).filter((i) => i.id !== item.id && label(i) !== label(item))
  const near = pool.filter((i) => lookalikeOf.get(item.char)?.includes(i.char) || i.group === item.group)
  const distract = shuffle([...sample(near, 2), ...sample(pool, 6)]).filter(
    (v, i, a) => a.findIndex((x) => label(x) === label(v)) === i,
  )

  if (mode === 'reading' && item.examples) {
    const exampleIdx = Math.floor(Math.random() * item.examples.length)
    const ex = item.examples[exampleIdx]
    const others = shuffle(itemsOf('kanji').flatMap((k) => k.examples ?? []).filter((e) => e.r !== ex.r))
      .slice(0, 3)
      .map((e) => e.r)
    return { item, mode, prompt: ex.w, options: shuffle([ex.r, ...others]), answer: ex.r, exampleIdx }
  }
  if (mode === 'pick-romaji' || mode === 'type-romaji') {
    return { item, mode, prompt: item.char, options: shuffle([label(item), ...distract.slice(0, 3).map(label)]), answer: label(item) }
  }
  // pick-char & listen
  return {
    item,
    mode,
    prompt: mode === 'listen' ? '' : label(item),
    options: shuffle([item.char, ...distract.slice(0, 3).map((d) => d.char)]),
    answer: item.char,
  }
}

export default function Quiz({ items, modes, title, onExit }: { items: Item[]; modes: Mode[]; title: string; onExit: () => void }) {
  const [seed, setSeed] = useState(0)
  const [queue, setQueue] = useState<Item[]>(() => shuffle(items))
  const questions = useMemo(() => queue.map((it) => makeQ(it, modes)), [queue, modes, seed])
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [missed, setMissed] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const q = questions[idx]
  const done = idx >= questions.length

  useEffect(() => {
    if (!q) return
    if (q.mode === 'listen') setTimeout(() => speak(q.item.speak), 150)
    if (q.mode === 'type-romaji') setTimeout(() => inputRef.current?.focus(), 50)
  }, [idx, q])

  const correct = chosen !== null && chosen === q?.answer

  const answer = (opt: string) => {
    if (chosen !== null || !q) return
    const ok = norm(opt) === norm(q.answer)
    setChosen(ok ? q.answer : opt || '—')
    record(q.item.id, ok)
    if (q.mode !== 'reading') speak(q.item.speak)
    else speak(q.answer)
    if (ok) {
      setScore((s) => s + 1)
      setTimeout(next, 750)
    } else setMissed((m) => [...m, q.item])
  }

  function next() {
    setChosen(null)
    setTyped('')
    setIdx((i) => i + 1)
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!q || q.mode === 'type-romaji' && chosen === null) return
      if (chosen !== null && !correct && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        next()
      }
      const n = parseInt(e.key)
      if (chosen === null && n >= 1 && n <= q.options.length) answer(q.options[n - 1])
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="quiz card">
        <h2>{pct >= 90 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good work' : '💪 Keep going'}</h2>
        <div className="score-ring" style={{ ['--p' as string]: pct }}>
          <span>{pct}%</span>
        </div>
        <p className="center-text">
          {score} / {questions.length} correct. Your misses come back sooner in Review; correct ones are spaced further apart.
        </p>
        {missed.length > 0 && (
          <>
            <h3>Re-read these stories</h3>
            <div className="missed">
              {[...new Map(missed.map((m) => [m.id, m])).values()].map((m) => (
                <MnemonicCard key={m.id} item={m} compact />
              ))}
            </div>
          </>
        )}
        <div className="row gap-s center">
          {missed.length > 0 && (
            <button
              className="btn accent"
              onClick={() => {
                setQueue(shuffle([...new Map(missed.map((m) => [m.id, m])).values()]))
                setSeed((s) => s + 1)
                setIdx(0)
                setScore(0)
                setMissed([])
              }}
            >
              Retry the {new Set(missed.map((m) => m.id)).size} I missed
            </button>
          )}
          <button
            className="btn"
            onClick={() => {
              setQueue(shuffle(items))
              setSeed((s) => s + 1)
              setIdx(0)
              setScore(0)
              setMissed([])
            }}
          >
            Again
          </button>
          <button className="btn ghost-btn" onClick={onExit}>Done</button>
        </div>
      </div>
    )
  }

  const isCharOpt = q.mode === 'pick-char' || q.mode === 'listen'
  return (
    <div className="quiz card">
      <div className="quiz-top">
        <button className="btn small ghost-btn" onClick={onExit}>✕ Quit</button>
        <span className="muted">{title}</span>
        <span className="muted">{idx + 1}/{questions.length}</span>
      </div>
      <div className="progress"><div style={{ width: `${(idx / questions.length) * 100}%` }} /></div>

      <div className="q-label">{MODE_LABEL[q.mode]}</div>
      <div className={`q-prompt ${q.mode === 'pick-char' ? 'romaji-prompt' : ''} ${q.item.script}`}>
        {q.mode === 'listen' ? (
          <button className="listen-btn" onClick={() => speak(q.item.speak)}>🔊</button>
        ) : (
          q.prompt
        )}
      </div>
      {q.mode === 'listen' && (
        <button className="btn small ghost-btn center-block" onClick={() => speak(q.item.speak, 0.5)}>🐢 slower</button>
      )}

      {q.mode === 'type-romaji' ? (
        <form
          className="type-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (chosen === null) answer(typed)
            else if (!correct) next()
          }}
        >
          <input
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="type romaji, e.g. ka"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            readOnly={chosen !== null}
            className={chosen === null ? '' : correct ? 'right' : 'wrong'}
          />
          <button className="btn accent">{chosen === null ? 'Check' : 'Next →'}</button>
        </form>
      ) : (
        <div className={`options ${isCharOpt ? 'char-opts' : ''}`}>
          {q.options.map((o, i) => {
            const state = chosen === null ? '' : o === q.answer ? 'right' : o === chosen ? 'wrong' : 'dim'
            return (
              <button key={o + i} className={`opt ${state} ${isCharOpt ? q.item.script : ''}`} onClick={() => answer(o)}>
                <span className="key">{i + 1}</span>
                {o}
              </button>
            )
          })}
        </div>
      )}

      {chosen !== null && !correct && (
        <div className="feedback">
          <div className="bad">
            Not quite: <b className={q.item.script}>{q.item.char}</b> = <b>{q.mode === 'reading' ? q.answer : label(q.item)}</b>
            {q.mode === 'reading' && q.exampleIdx !== undefined && <> ({q.item.examples![q.exampleIdx].m})</>}
          </div>
          <MnemonicCard item={q.item} compact />
          {q.mode !== 'type-romaji' && <button className="btn accent" onClick={next}>Next → <span className="muted">(Enter)</span></button>}
        </div>
      )}
      {chosen !== null && correct && <div className="good center-text pop">✓ {q.item.char} = {q.mode === 'reading' ? q.answer : label(q.item)}</div>}
    </div>
  )
}

import { useState } from 'react'
import { groupsOf, itemsOf, type Script } from '../data'
import Quiz, { MODE_LABEL, type Mode } from '../components/Quiz'
import { sample } from '../lib/util'

const KANA_MODES: Mode[] = ['pick-romaji', 'type-romaji', 'pick-char', 'listen', 'write']
const KANJI_MODES: Mode[] = ['pick-romaji', 'pick-char', 'reading', 'listen', 'write']

export default function Practice() {
  const [script, setScript] = useState<Script>('hiragana')
  const groups = groupsOf(script)
  const [sel, setSel] = useState<string[]>(['a', 'k'])
  const [modes, setModes] = useState<Mode[]>(['pick-romaji', 'listen'])
  const [count, setCount] = useState(20)
  const [running, setRunning] = useState<{ items: ReturnType<typeof itemsOf> } | null>(null)

  const allowed = script === 'kanji' ? KANJI_MODES : KANA_MODES
  const pool = itemsOf(script).filter((i) => sel.includes(i.group))

  const switchScript = (s: Script) => {
    setScript(s)
    setSel([groupsOf(s)[0].key])
    setModes(['pick-romaji'])
  }

  if (running)
    return (
      <div className="page narrow">
        <Quiz items={running.items} modes={modes} title="Practice" onExit={() => setRunning(null)} />
      </div>
    )

  return (
    <div className="page narrow">
      <h1>Practice</h1>
      <div className="panel form">
        <div className="field">
          <span className="field-label">Script</span>
          <div className="seg">
            {(['hiragana', 'katakana', 'kanji'] as Script[]).map((s) => (
              <button key={s} className={script === s ? 'on' : ''} onClick={() => switchScript(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">
            Rows <button className="link" onClick={() => setSel(groups.map((g) => g.key))}>all</button>{' '}
            <button className="link" onClick={() => setSel([])}>none</button>
          </span>
          <div className="chips">
            {groups.map((g) => (
              <button
                key={g.key}
                className={`chip ${sel.includes(g.key) ? 'on' : ''}`} aria-pressed={sel.includes(g.key)}
                onClick={() => setSel(sel.includes(g.key) ? sel.filter((x) => x !== g.key) : [...sel, g.key])}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">Question types</span>
          <div className="chips">
            {allowed.map((m) => (
              <button
                key={m}
                className={`chip ${modes.includes(m) ? 'on' : ''}`} aria-pressed={modes.includes(m)}
                onClick={() => setModes(modes.includes(m) ? modes.filter((x) => x !== m) : [...modes, m])}
              >
                {script === 'kanji' && m === 'pick-romaji' ? 'See it, choose the meaning' : script === 'kanji' && m === 'pick-char' ? 'Meaning, choose the kanji' : MODE_LABEL[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="qcount">Questions: <span className="tnum">{Math.min(count, pool.length)}</span></label>
          <input id="qcount" type="range" min={5} max={60} step={5} value={count} onChange={(e) => setCount(+e.target.value)} />
        </div>
        <button
          className="btn primary big"
          disabled={!pool.length || !modes.length}
          onClick={() => setRunning({ items: sample(pool, Math.min(count, pool.length)) })}
        >
          Start practice
        </button>
      </div>
    </div>
  )
}

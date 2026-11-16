import { useRef } from 'react'
import { ALL, hiragana, katakana, kanji } from '../data'
import { dueIds, exportProgress, importProgress, mastery, resetProgress, today, useStore } from '../lib/store'

const SCRIPTS = [
  { key: 'hiragana', name: 'Hiragana', jp: 'ひらがな', sample: 'あ', items: hiragana, blurb: 'The curvy everyday alphabet. Start here.' },
  { key: 'katakana', name: 'Katakana', jp: 'カタカナ', sample: 'ア', items: katakana, blurb: 'Angular twins used for foreign words like コーヒー.' },
  { key: 'kanji', name: 'Kanji', jp: '漢字', sample: '山', items: kanji, blurb: '95 JLPT N5 kanji built from picture stories.' },
] as const

export default function Home() {
  const store = useStore()
  const due = dueIds(ALL.map((i) => i.id)).length
  const answeredToday = store.history[today()] ?? 0
  const goal = 40
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>
            Remember Japanese characters <em>by picturing them.</em>
          </h1>
          <p className="lead">
            Every character comes with a picture story, real audio, an animated stroke order and a writing pad. A spaced-repetition
            scheduler brings each one back right before you would forget it.
          </p>
          <div className="row gap-s">
            <a className="btn accent big" href="#/learn/hiragana">Start learning</a>
            <a className="btn big" href="#/review">
              Review {due > 0 && <span className="badge">{due}</span>}
            </a>
          </div>
        </div>
        <div className="hero-card" aria-hidden>
          <div className="hero-pic">
            <span className="hero-emoji">🐈</span>
            <span className="hero-char">ね</span>
          </div>
          <div className="hero-cap">
            <b>ne</b>: a cat (<i>neko</i>) with a curly tail
          </div>
        </div>
      </section>

      <section className="method">
        {[
          ['🖼️', 'Picture it', 'A vivid image links the shape to the sound.'],
          ['🔊', 'Hear it', 'Native-voice audio, slow mode and a mic check.'],
          ['✍️', 'Write it', 'Watch the strokes, then trace them yourself.'],
          ['🔁', 'Recall it', 'Quizzes that resurface what you are about to forget.'],
        ].map(([i, t, d], n) => (
          <div key={t} className="step">
            <span className="step-n">{n + 1}</span>
            <span className="step-i">{i}</span>
            <b>{t}</b>
            <span className="muted">{d}</span>
          </div>
        ))}
      </section>

      <section className="today card">
        <div>
          <h3>Today</h3>
          <div className="progress big-bar"><div style={{ width: `${Math.min(100, (answeredToday / goal) * 100)}%` }} /></div>
          <div className="muted small-text">
            {answeredToday}/{goal} answers toward your daily goal · 🔥 {store.streak.count}-day streak
          </div>
        </div>
        <a className="btn accent" href={due ? '#/review' : '#/practice'}>{due ? `Review ${due} due` : 'Quick practice'}</a>
      </section>

      <section className="scripts">
        {SCRIPTS.map((s) => {
          const ids = s.items.map((i) => i.id)
          const m = mastery(ids)
          return (
            <a key={s.key} className="script-card card" href={`#/learn/${s.key}`}>
              <span className={`script-sample ${s.key}`}>{s.sample}</span>
              <div className="script-info">
                <h3>{s.name} <span className="jp muted">{s.jp}</span></h3>
                <p className="muted small-text">{s.blurb}</p>
                <div className="progress two">
                  <div className="learned" style={{ width: `${(m.learned / ids.length) * 100}%` }} />
                  <div className="mastered" style={{ width: `${(m.mastered / ids.length) * 100}%` }} />
                </div>
                <div className="small-text muted">
                  {m.learned} learning · {m.mastered} mastered · {ids.length} total
                </div>
              </div>
            </a>
          )
        })}
      </section>

      <section className="card tips-card">
        <h3>How to get the most out of it</h3>
        <ul>
          <li><b>Little and often.</b> 10–15 minutes a day beats an hour once a week. Spacing is what moves things into long-term memory.</li>
          <li><b>Say it out loud</b> every time you see a character. Sound + image + hand movement = three hooks instead of one.</li>
          <li><b>Make the picture silly.</b> Exaggerated, funny or gross images are remembered best. Rewrite any story that doesn’t click in the ✏️ box.</li>
          <li><b>One row at a time.</b> Do a lesson, then the quiz for that row, before moving on. Come back for Review the next day.</li>
          <li><b>Drill the look-alikes</b> (シ/ツ, ソ/ン, ね/れ/わ) side by side once you know them individually.</li>
        </ul>
      </section>

      <section className="data-tools">
        <button className="btn small ghost-btn" onClick={() => {
          const blob = new Blob([exportProgress()], { type: 'application/json' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = 'kanamind-progress.json'
          a.click()
        }}>⬇ Export progress</button>
        <button className="btn small ghost-btn" onClick={() => fileRef.current?.click()}>⬆ Import progress</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          try { importProgress(await f.text()); alert('Progress imported.') } catch { alert('That file could not be read.') }
        }} />
        <button className="btn small ghost-btn" onClick={() => confirm('Erase all progress in this browser?') && resetProgress()}>Reset</button>
      </section>
    </div>
  )
}

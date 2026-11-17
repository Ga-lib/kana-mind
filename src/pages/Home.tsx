import { ALL, hiragana, katakana, kanji } from '../data'
import { dueIds, mastery, today, useStore } from '../lib/store'
import ProgressTools from '../components/ProgressTools'
import { useAccount } from '../lib/account'
import Icon, { Seal, type IconName } from '../components/Icon'
import Illustration from '../components/Illustration'

const SCRIPTS = [
  { key: 'hiragana', name: 'Hiragana', jp: 'ひらがな', sample: 'あ', items: hiragana, blurb: 'The curvy everyday script. Start here.' },
  { key: 'katakana', name: 'Katakana', jp: 'カタカナ', sample: 'ア', items: katakana, blurb: 'Angular twins for borrowed words like コーヒー.' },
  { key: 'kanji', name: 'Kanji', jp: '漢字', sample: '山', items: kanji, blurb: `All ${kanji.length} JLPT N5 to N3 kanji, built from pictures and parts.` },
] as const

const METHOD: [IconName, string, string][] = [
  ['picture', 'Picture it', 'A vivid scene ties the shape to its sound.'],
  ['speaker', 'Hear it', 'Native audio, a slow mode and a microphone check.'],
  ['brush', 'Write it', 'Watch the strokes, then trace them yourself.'],
  ['cycle', 'Recall it', 'Quizzes bring each one back just before you forget.'],
]

export default function Home() {
  const store = useStore()
  const { user } = useAccount()
  const due = dueIds(ALL.map((i) => i.id)).length
  const answeredToday = store.history[today()] ?? 0
  const goal = 40
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <h1>Remember every character by picturing it.</h1>
          <p className="lead">
            Each kana and kanji comes with a picture story, native audio, its stroke order and a pad to practise on. Spaced review
            brings it back right before it fades.
          </p>
          <div className="row gap-s">
            <a className="btn primary big" href="#/learn/hiragana">Start with hiragana</a>
            <a className="btn big" href="#/review">
              Review{due > 0 && <span className="badge tnum">{due}</span>}
            </a>
          </div>
        </div>
        <figure className="hero-sheet" aria-label="Example: ね is a cat, neko, with a curly tail">
          <div className="hero-square">
            <Illustration char="ね" size={250} />
            <span className="hero-badge" aria-hidden>🐈</span>
            <span className="hero-stamp">
              <Seal text="neko" size="l" />
            </span>
          </div>
          <figcaption>
            <span className="jp hero-kana">ね</span> <b>ne</b>, a cat (<i>neko</i>) curling its tail
          </figcaption>
        </figure>
      </section>

      <ol className="method">
        {METHOD.map(([icon, t, d]) => (
          <li key={t}>
            <Icon name={icon} size={26} />
            <b>{t}</b>
            <span className="muted">{d}</span>
          </li>
        ))}
      </ol>

      <section className="today panel">
        <div className="today-main">
          <h2>{user ? `Today, ${user.name || "welcome back"}` : "Today"}</h2>
          <div className="progress big-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(goal, answeredToday)}>
            <div style={{ width: `${Math.min(100, (answeredToday / goal) * 100)}%` }} />
          </div>
          <p className="muted small-text">
            <span className="tnum">{answeredToday}</span> of {goal} answers for today’s goal. Streak: <span className="tnum">{store.streak.count}</span>{' '}
            {store.streak.count === 1 ? 'day' : 'days'}.
          </p>
        </div>
        <a className="btn primary" href={due ? '#/review' : '#/practice'}>
          {due ? `Review ${due} due` : 'Quick practice'}
        </a>
      </section>

      <section className="scripts">
        {SCRIPTS.map((s) => {
          const ids = s.items.map((i) => i.id)
          const m = mastery(ids)
          return (
            <a key={s.key} className="script-card panel" href={`#/learn/${s.key}`}>
              <span className={`script-sample square ${s.key}`} aria-hidden>{s.sample}</span>
              <span className="script-info">
                <span className="script-name">
                  {s.name} <span className="jp muted">{s.jp}</span>
                </span>
                <span className="muted small-text">{s.blurb}</span>
                <span className="progress two">
                  <span className="learned" style={{ width: `${(m.learned / ids.length) * 100}%` }} />
                  <span className="mastered" style={{ width: `${(m.mastered / ids.length) * 100}%` }} />
                </span>
                <span className="small-text muted tnum">
                  {m.learned} learning, {m.mastered} mastered, {ids.length} in total
                </span>
              </span>
            </a>
          )
        })}
      </section>

      <section className="panel tips-card">
        <h2>How to make it stick</h2>
        <ul>
          <li><b>Little and often.</b> Ten to fifteen minutes a day beats an hour once a week. Spacing moves things into long-term memory.</li>
          <li><b>Say it out loud</b> every time you see a character. Sound, image and hand movement give three hooks instead of one.</li>
          <li><b>Make the picture silly.</b> Exaggerated or funny images are remembered best. Rewrite any story that doesn’t click.</li>
          <li><b>One row at a time.</b> Do a lesson, then that row’s quiz, before moving on. Come back to Review the next day.</li>
          <li><b>Drill the look-alikes</b> (シ and ツ, ソ and ン, ね れ わ) once you know them one by one.</li>
        </ul>
      </section>

      <ProgressTools />
    </div>
  )
}

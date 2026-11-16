import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Lookalikes from './pages/Lookalikes'
import Sounds from './pages/Sounds'
import { useStore } from './lib/store'
import Icon, { type IconName } from './components/Icon'

const SCRIPTS = ['hiragana', 'katakana', 'kanji'] as const
type ScriptName = (typeof SCRIPTS)[number]

function useHash() {
  const [hash, setHash] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => {
      setHash(location.hash.slice(1) || '/')
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return hash
}

const NAV: [string, string, IconName][] = [
  ['/', 'Home', 'home'],
  ['/learn/hiragana', 'Learn', 'book'],
  ['/practice', 'Practice', 'target'],
  ['/review', 'Review', 'cycle'],
  ['/lookalikes', 'Look-alikes', 'twins'],
  ['/sounds', 'Sounds', 'wave'],
]

export default function App() {
  const route = useHash()
  const { streak, xp } = useStore()
  const parts = route.split('/').filter(Boolean)

  let page
  switch (parts[0]) {
    case 'learn': {
      // Only accept known script names from the URL.
      const s = SCRIPTS.includes(parts[1] as ScriptName) ? (parts[1] as ScriptName) : 'hiragana'
      page = <Learn script={s} />
      break
    }
    case 'practice':
      page = <Practice />
      break
    case 'review':
      page = <Review />
      break
    case 'lookalikes':
      page = <Lookalikes />
      break
    case 'sounds':
      page = <Sounds />
      break
    default:
      page = <Home />
  }

  const section = parts[0] ?? ''
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <a href="#/" className="brand" aria-label="KanaMind home">
          <span className="brand-seal" aria-hidden>
            <span>仮名</span>
          </span>
          <span className="brand-name">KanaMind</span>
        </a>
        <nav aria-label="Main">
          {NAV.map(([href, name, icon]) => {
            const on = href === '/' ? section === '' : href.split('/')[1] === section
            return (
              <a key={href} href={'#' + href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                <Icon name={icon} size={20} />
                <span className="nav-text">{name}</span>
              </a>
            )
          })}
        </nav>
        <div className="stats">
          <span title="Days in a row" aria-label={`${streak.count} day streak`}>
            <Icon name="flame" size={18} className="flame" /> <b className="tnum">{streak.count}</b>
          </span>
          <span title="Points" aria-label={`${xp} points`}>
            <Icon name="blossom" size={18} className="blossom" /> <b className="tnum">{xp}</b>
          </span>
        </div>
      </header>
      <main id="main" key={section + (parts[1] ?? '')} className="route">
        {page}
      </main>
      <footer>
        <p>
          Stroke data from <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener noreferrer">KanjiVG</a> (CC BY-SA 3.0).
          Audio uses your browser’s Japanese voice. Progress stays in this browser.
        </p>
      </footer>
    </>
  )
}

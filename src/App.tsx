import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Lookalikes from './pages/Lookalikes'
import Sounds from './pages/Sounds'
import { useStore } from './lib/store'

function useHash() {
  const [hash, setHash] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => {
      setHash(location.hash.slice(1) || '/')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return hash
}

const NAV = [
  ['/', 'Home', '🏠'],
  ['/learn/hiragana', 'Learn', '📖'],
  ['/practice', 'Practice', '🎯'],
  ['/review', 'Review', '🔁'],
  ['/lookalikes', 'Look-alikes', '👯'],
  ['/sounds', 'Sounds', '🔊'],
] as const

export default function App() {
  const route = useHash()
  const { streak, xp } = useStore()
  const parts = route.split('/').filter(Boolean)

  let page
  switch (parts[0]) {
    case 'learn':
      page = <Learn script={(parts[1] as 'hiragana' | 'katakana' | 'kanji') ?? 'hiragana'} />
      break
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

  return (
    <>
      <header className="topbar">
        <a href="#/" className="brand">
          <span className="brand-mark">か</span>
          <span>KanaMind</span>
        </a>
        <nav>
          {NAV.map(([href, name, icon]) => (
            <a key={href} href={'#' + href} className={(href === '/' ? route === '/' : route.startsWith(href.split('/').slice(0, 2).join('/'))) ? 'on' : ''}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-text">{name}</span>
            </a>
          ))}
        </nav>
        <div className="stats" title="Daily streak and experience points">
          <span>🔥 {streak.count}</span>
          <span>⭐ {xp}</span>
        </div>
      </header>
      <main>{page}</main>
      <footer>
        Free & open. Stroke data from <a href="https://kanjivg.tagaini.net" target="_blank" rel="noreferrer">KanjiVG</a> (CC BY-SA 3.0).
        Audio uses your browser’s built-in Japanese voice. Progress is saved in this browser only.
      </footer>
    </>
  )
}

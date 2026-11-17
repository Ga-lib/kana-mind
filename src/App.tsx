import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Lookalikes from './pages/Lookalikes'
import Sounds from './pages/Sounds'
import Words from './pages/Words'
import Account from './pages/Account'
import { useAccount } from './lib/account'
import SpeechNotice from './components/SpeechNotice'
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
  ['/words', 'Words', 'words'],
  ['/practice', 'Practice', 'target'],
  ['/review', 'Review', 'cycle'],
  ['/lookalikes', 'Look-alikes', 'twins'],
  ['/sounds', 'Sounds', 'wave'],
]

export default function App() {
  const route = useHash()
  const { streak, xp } = useStore()
  const { user, ready } = useAccount()
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
    case 'account':
      page = <Account />
      break
    case 'words':
      page = <Words />
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
          <a href="#/account" className={`account-btn ${user ? 'in' : ''} ${section === 'account' ? 'on' : ''}`} aria-label={user ? `Account: ${user.email ?? ''}` : 'Sign in'}>
            {user ? (
              <span className="avatar" aria-hidden>{(user.name || user.email || '?').slice(0, 1).toUpperCase()}</span>
            ) : (
              <>
                <Icon name="user" size={18} />
                <span className="account-text">{ready ? 'Sign in' : ''}</span>
              </>
            )}
          </a>
        </div>
      </header>
      <main id="main" key={section + (parts[1] ?? '')} className="route">
        {page}
      </main>
      <SpeechNotice />
      <footer>
        <p>
          Stroke data from <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener noreferrer">KanjiVG</a> (CC BY-SA 3.0). Line art from <a href="https://openmoji.org" target="_blank" rel="noopener noreferrer">OpenMoji</a> (CC BY-SA 4.0). Kanji data from KANJIDIC (EDRDG, CC BY-SA); word lists from Jonathan Waller’s JLPT lists via open-anki-jlpt-decks.
          Audio uses your browser’s Japanese voice. Sign in to keep your progress in your own account.
        </p>
      </footer>
    </>
  )
}

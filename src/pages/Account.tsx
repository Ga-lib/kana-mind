import { useState } from 'react'
import { authMessage, clearNotice, deleteAccount, resetPassword, signIn, signInWithGoogle, signOutUser, signUp, useAccount, type SyncStatus } from '../lib/account'
import { useStore } from '../lib/store'
import Icon from '../components/Icon'
import ProgressTools from '../components/ProgressTools'

const SYNC_TEXT: Record<SyncStatus, string> = {
  idle: '',
  loading: 'Loading your progress…',
  saving: 'Saving…',
  saved: 'All progress saved to your account',
  offline: 'Offline. Changes are kept on this device and saved when you reconnect.',
  error: 'Couldn’t reach the server. Changes are kept on this device and retried.',
}

function SignedIn() {
  const { user, sync, notice } = useAccount()
  const { xp, streak, cards } = useStore()
  const [busy, setBusy] = useState(false)
  if (!user) return null
  const learned = Object.values(cards).filter((c) => c.box >= 2).length
  return (
    <>
      <div className="panel profile">
        <span className="avatar big" aria-hidden>{(user.name || user.email || '?').slice(0, 1).toUpperCase()}</span>
        <div className="profile-main">
          <h2>{user.name || 'Learner'}</h2>
          <p className="muted small-text">{user.email} · signed in with {user.provider}</p>
          <p className={`sync sync-${sync} small-text`} role="status">
            <Icon name={sync === 'saved' ? 'check' : sync === 'offline' || sync === 'error' ? 'cross' : 'cycle'} size={15} /> {SYNC_TEXT[sync]}
          </p>
        </div>
        <button
          className="btn"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            const r = await signOutUser()
            if (!r.ok) {
              const force = confirm(
                'Some of your latest progress hasn’t reached your account yet (you seem to be offline).\n\nSign out anyway and lose that unsaved progress? Choose Cancel to stay signed in and try again when you’re online.',
              )
              if (force) await signOutUser(true)
            }
            setBusy(false)
          }}
        >
          Sign out
        </button>
      </div>
      {notice && (
        <div className="tip">
          <Icon name="check" size={18} />
          <p>{notice} <button className="link" onClick={clearNotice}>OK</button></p>
        </div>
      )}
      <div className="stat-row">
        <div className="panel stat"><b className="tnum">{xp}</b><span className="muted small-text">points</span></div>
        <div className="panel stat"><b className="tnum">{streak.count}</b><span className="muted small-text">day streak</span></div>
        <div className="panel stat"><b className="tnum">{learned}</b><span className="muted small-text">characters learning or mastered</span></div>
      </div>
      <ProgressTools />
      <DeleteAccount provider={user.provider} />
    </>
  )
}

function DeleteAccount({ provider }: { provider: string }) {
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [typed, setTyped] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (!open)
    return (
      <div className="danger-zone">
        <button className="btn small quiet danger" onClick={() => setOpen(true)}>
          <Icon name="reset" size={15} /> Delete my account
        </button>
      </div>
    )
  return (
    <form
      className="panel danger-zone open"
      onSubmit={async (e) => {
        e.preventDefault()
        setErr('')
        setBusy(true)
        try {
          await deleteAccount(provider === 'Email' ? pw : undefined)
        } catch (e) {
          setErr(authMessage(e))
          setBusy(false)
        }
      }}
    >
      <h2>Delete your account</h2>
      <p className="small-text">
        This permanently deletes your login and all progress saved in your account: memory levels, review schedule, notes,
        streak and points. It can’t be undone. Export your progress first if you might want it back.
      </p>
      {provider === 'Email' ? (
        <label className="auth-form-label">
          <span>Confirm with your password</span>
          <input type="password" autoComplete="current-password" value={pw} maxLength={128} onChange={(e) => setPw(e.target.value)} />
        </label>
      ) : (
        <p className="small-text muted">You’ll confirm with Google in a pop-up.</p>
      )}
      <label className="auth-form-label">
        <span>Type DELETE to confirm</span>
        <input value={typed} maxLength={10} autoCapitalize="characters" onChange={(e) => setTyped(e.target.value)} />
      </label>
      {err && <p className="bad small-text" role="alert">{err}</p>}
      <div className="row gap-s">
        <button className="btn danger-solid" disabled={busy || typed !== 'DELETE' || (provider === 'Email' && !pw)}>
          {busy ? 'Deleting…' : 'Delete account permanently'}
        </button>
        <button type="button" className="btn quiet" disabled={busy} onClick={() => { setOpen(false); setErr(''); setPw(''); setTyped('') }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function SignedOut() {
  const [tab, setTab] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setErr('')
    setInfo('')
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      setErr(authMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'up' && pw !== pw2) return setErr('The two passwords don’t match.')
    void run(() => (tab === 'up' ? signUp(name, email, pw) : signIn(email, pw)))
  }

  return (
    <div className="auth-wrap">
      <div className="panel auth">
        <div className="seg auth-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'in'} className={tab === 'in' ? 'on' : ''} onClick={() => { setTab('in'); setErr('') }}>
            Sign in
          </button>
          <button role="tab" aria-selected={tab === 'up'} className={tab === 'up' ? 'on' : ''} onClick={() => { setTab('up'); setErr('') }}>
            Create account
          </button>
        </div>

        <button className="btn google-btn" disabled={busy} onClick={() => void run(signInWithGoogle)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
          </svg>
          Continue with Google
        </button>
        <div className="or"><span>or with email</span></div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {tab === 'up' && (
            <label>
              <span>Name <span className="muted">(optional)</span></span>
              <input value={name} maxLength={40} autoComplete="name" onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label>
            <span>Email</span>
            <input type="email" required value={email} maxLength={254} autoComplete="email" inputMode="email" onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <span className="pw">
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={tab === 'up' ? 8 : undefined}
                maxLength={128}
                value={pw}
                autoComplete={tab === 'up' ? 'new-password' : 'current-password'}
                onChange={(e) => setPw(e.target.value)}
              />
              <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow((s) => !s)}>
                <Icon name="eye" size={18} />
              </button>
            </span>
            {tab === 'up' && <span className="muted small-text">At least 8 characters.</span>}
          </label>
          {tab === 'up' && (
            <label>
              <span>Repeat password</span>
              <input type={show ? 'text' : 'password'} required maxLength={128} value={pw2} autoComplete="new-password" onChange={(e) => setPw2(e.target.value)} />
            </label>
          )}
          {tab === 'up' && (
            <p className="muted small-text">
              By creating an account you agree to how we handle your data, described in the <a href="#/privacy">privacy policy</a>.
            </p>
          )}
          {err && <p className="bad small-text" role="alert">{err}</p>}
          {info && <p className="good small-text" role="status">{info}</p>}
          <button className="btn primary big" disabled={busy || !email || !pw}>
            {busy ? 'Please wait…' : tab === 'up' ? 'Create account' : 'Sign in'}
          </button>
          {tab === 'in' && (
            <button
              type="button"
              className="link"
              disabled={busy}
              onClick={() => {
                if (!email) return setErr('Enter your email above, then press “Forgot password?” again.')
                void run(async () => {
                  await resetPassword(email)
                  setInfo('If an account exists for that email, a reset link is on its way.')
                })
              }}
            >
              Forgot password?
            </button>
          )}
        </form>
      </div>
      <div className="auth-side">
        <h2>Why sign in?</h2>
        <ul>
          <li>Your progress, streak, notes and review schedule are saved to your own account.</li>
          <li>Pick up where you left off on any phone or computer.</li>
          <li>Anything you learned before signing in on this device is added to your account.</li>
          <li>Only you can see or change your progress. You can export it, erase it or delete your account at any time. See the <a href="#/privacy">privacy policy</a>.</li>
        </ul>
        <ProgressTools />
      </div>
    </div>
  )
}

export default function Account() {
  const { ready, user } = useAccount()
  return (
    <div className="page narrow">
      <h1>{user ? 'Your account' : 'Sign in to save your progress'}</h1>
      {!ready ? <p className="muted">Checking your sign-in…</p> : user ? <SignedIn /> : <SignedOut />}
    </div>
  )
}

// Accounts and cloud progress (Firebase Auth + Cloud Firestore, free Spark plan).
//
// Model: one Firestore document per learner at kanamind_users/{uid}. Security rules (firestore.rules)
// only let a signed-in user get/create/update/delete the document whose id equals their own uid, and
// validate its shape, so no user can read or change anyone else's progress.
//
// Progress is local-first: every change is applied instantly in the browser and cached under a
// per-account key, then written to Firestore (debounced). On sign-in the cloud copy is restored and
// merged with anything learned on this device; on sign-out the account's local cache is removed.
import { useSyncExternalStore } from 'react'
import { firebaseConfig } from './firebaseConfig'
import {
  GUEST_KEY,
  getState,
  hasProgress,
  loadFrom,
  mergeStates,
  onProgressChange,
  sanitize,
  switchProfile,
  type State,
} from './store'

type Fb = {
  auth: import('firebase/auth').Auth
  db: import('firebase/firestore').Firestore
  A: typeof import('firebase/auth')
  F: typeof import('firebase/firestore')
}

export type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'offline' | 'error'
export interface AccountState {
  ready: boolean // auth state known
  user: null | { uid: string; email: string | null; name: string | null; provider: string; verified: boolean }
  sync: SyncStatus
  savedAt: number | null
  notice: string
}

let acct: AccountState = { ready: false, user: null, sync: 'idle', savedAt: null, notice: '' }
const subs = new Set<() => void>()
function set(p: Partial<AccountState>) {
  acct = { ...acct, ...p }
  subs.forEach((s) => s())
}
export function useAccount(): AccountState {
  return useSyncExternalStore(
    (l) => {
      subs.add(l)
      return () => subs.delete(l)
    },
    () => acct,
  )
}

let fbPromise: Promise<Fb> | null = null
function fb(): Promise<Fb> {
  fbPromise ??= (async () => {
    const [{ initializeApp }, A, F] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
    const app = initializeApp(firebaseConfig)
    const auth = A.getAuth(app)
    const db = F.getFirestore(app)
    return { auth, db, A, F }
  })()
  return fbPromise
}

const userKey = (uid: string) => `kanamind:u:${uid}`
const docPath = (uid: string) => ['kanamind_users', uid] as const

// ---------- cloud sync ----------
let saveTimer: ReturnType<typeof setTimeout> | null = null
let pending: State | null = null
let currentUid: string | null = null
// Cloud writes are only allowed once the account's cloud copy has been read, so a failed load
// (e.g. offline at sign-in) can never overwrite real progress with an incomplete local copy.
let loadedUid: string | null = null

async function writeCloud(uid: string, s: State) {
  const { db, F } = await fb()
  set({ sync: 'saving' })
  try {
    await F.setDoc(F.doc(db, ...docPath(uid)), { ...s, v: 1, updatedAt: F.serverTimestamp() })
    if (currentUid === uid) set({ sync: 'saved', savedAt: Date.now() })
  } catch {
    set({ sync: navigator.onLine ? 'error' : 'offline' })
    throw new Error('save failed')
  }
}

function scheduleSave(s: State) {
  if (!currentUid) return
  if (loadedUid !== currentUid) {
    pending = s
    return
  }
  pending = s
  set({ sync: 'saving' })
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => void flush(), 1200)
}

export async function flush() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  const uid = currentUid
  const s = pending
  pending = null
  if (uid && s && loadedUid !== uid) {
    pending = s
    return
  }
  if (uid && s) await writeCloud(uid, s).catch(() => {
    pending = s // keep it for the next attempt
  })
}

onProgressChange(scheduleSave)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (currentUid && loadedUid !== currentUid) {
      void restore(currentUid)
      return
    }
    if (currentUid && (pending || acct.sync === 'offline' || acct.sync === 'error')) {
      pending ??= getState()
      void flush()
    }
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
}

/** Restore the account's progress from the cloud, merged with this device's copies. */
async function restore(uid: string) {
  const { db, F } = await fb()
  set({ sync: 'loading' })
  const cached = loadFrom(userKey(uid))
  const guest = loadFrom(GUEST_KEY)
  let cloud: State | null = null
  try {
    const snap = await F.getDoc(F.doc(db, ...docPath(uid)))
    cloud = snap.exists() ? sanitize(snap.data()) : null
  } catch {
    // Couldn't reach the cloud: show this device's copy, but don't write until the cloud copy loads.
    if (currentUid === uid) {
      switchProfile(userKey(uid), cached)
      set({ sync: navigator.onLine ? 'error' : 'offline' })
    }
    return
  }
  let next = cloud ? mergeStates(cloud, cached) : cached
  let notice = ''
  // Progress made before signing in on this device joins the account once, then the guest copy is cleared.
  if (hasProgress(guest)) {
    next = mergeStates(next, guest)
    try {
      localStorage.removeItem(GUEST_KEY)
    } catch {
      /* ignore */
    }
    notice = 'The progress you made before signing in has been added to your account.'
  }
  if (currentUid !== uid) return
  // Anything learned while the cloud copy was loading is kept too.
  if (pending) next = mergeStates(next, pending)
  loadedUid = uid
  switchProfile(userKey(uid), next)
  set({ notice })
  const changed = !cloud || JSON.stringify(cloud) !== JSON.stringify(next)
  if (changed) {
    pending = next
    await flush()
  } else set({ sync: 'saved', savedAt: Date.now() })
}

// ---------- auth lifecycle ----------
export function startAccount() {
  void fb().then(({ auth, A }) => {
    A.onAuthStateChanged(auth, (u) => {
      if (u) {
        const provider = u.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'
        const changedUser = currentUid !== u.uid
        currentUid = u.uid
        set({ ready: true, user: { uid: u.uid, email: u.email, name: u.displayName, provider, verified: u.emailVerified } })
        if (changedUser) void restore(u.uid)
      } else {
        currentUid = null
        loadedUid = null
        set({ ready: true, user: null, sync: 'idle', savedAt: null })
      }
    })
  })
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/missing-password': 'Enter your password.',
  'auth/weak-password': 'Use at least 8 characters for your password.',
  'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/popup-closed-by-user': 'The Google window was closed before signing in finished.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain': 'Google sign-in isn’t enabled for this web address yet.',
  'auth/operation-not-allowed': 'This sign-in method isn’t enabled yet.',
}
export function authMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  return MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

export async function signUp(name: string, email: string, password: string) {
  if (password.length < 8) throw { code: 'auth/weak-password' }
  const { auth, A } = await fb()
  const cred = await A.createUserWithEmailAndPassword(auth, email.trim(), password)
  if (name.trim()) await A.updateProfile(cred.user, { displayName: name.trim().slice(0, 40) })
  void A.sendEmailVerification(cred.user).catch(() => undefined)
  set({ user: acct.user && { ...acct.user, name: name.trim() || null } })
}

export async function signIn(email: string, password: string) {
  const { auth, A } = await fb()
  await A.signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function signInWithGoogle() {
  const { auth, A } = await fb()
  const provider = new A.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await A.signInWithPopup(auth, provider)
}

export async function resetPassword(email: string) {
  const { auth, A } = await fb()
  await A.sendPasswordResetEmail(auth, email.trim())
}

/** Save anything pending, sign out, and remove this account's progress from the browser. */
export async function signOutUser() {
  const { auth, A } = await fb()
  await flush()
  const uid = currentUid
  currentUid = null
  loadedUid = null
  pending = null
  await A.signOut(auth)
  if (uid) {
    try {
      localStorage.removeItem(userKey(uid))
    } catch {
      /* ignore */
    }
  }
  switchProfile(GUEST_KEY, loadFrom(GUEST_KEY))
  set({ notice: '' })
}

export function clearNotice() {
  set({ notice: '' })
}

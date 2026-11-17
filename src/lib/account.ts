// Accounts and cloud progress (Firebase Auth + Cloud Firestore, free Spark plan).
//
// Model: one Firestore document per learner at kanamind_users/{uid}. Security rules (firestore.rules)
// only let a signed-in user get/create/update/delete the document whose id equals their own uid, and
// validate its shape, so no user can read or change anyone else's progress.
//
// Sync is local-first and safe across devices and tabs:
//  - every change applies instantly in the browser and is cached under a per-account key;
//  - saves are batched (every few seconds and when the page is hidden) and run as a Firestore
//    transaction that reads the cloud copy and MERGES it with this device's copy, so progress made on
//    another device is never overwritten;
//  - a live listener merges changes from other devices into this one as they happen;
//  - Erase and Import bump an "epoch" (a replace timestamp). A copy with an older epoch can't bring
//    erased or replaced progress back: the newer epoch wins.
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
const epochKey = (uid: string) => `kanamind:u:${uid}:epoch`
const docPath = (uid: string) => ['kanamind_users', uid] as const
const SAVE_DELAY = 4000

function readEpoch(uid: string): number {
  try {
    return Number(localStorage.getItem(epochKey(uid))) || 0
  } catch {
    return 0
  }
}
function writeEpoch(uid: string, e: number) {
  try {
    localStorage.setItem(epochKey(uid), String(e))
  } catch {
    /* ignore */
  }
}
function clearLocal(uid: string) {
  try {
    localStorage.removeItem(userKey(uid))
    localStorage.removeItem(epochKey(uid))
  } catch {
    /* ignore */
  }
}
const same = (a: State, b: State) => JSON.stringify(a) === JSON.stringify(b)

// ---------- cloud sync ----------
let saveTimer: ReturnType<typeof setTimeout> | null = null
let dirty = false // local changes not yet confirmed by the cloud
let currentUid: string | null = null
// Cloud writes are only allowed once the account's cloud copy has been read, so a failed load
// (e.g. offline at sign-in) can never overwrite real progress with an incomplete local copy.
let loadedUid: string | null = null
let epoch = 0
let unlisten: (() => void) | null = null

/** Read-merge-write in one transaction. Returns the state now in the cloud. */
async function writeCloud(uid: string) {
  const { db, F } = await fb()
  set({ sync: 'saving' })
  const ref = F.doc(db, ...docPath(uid))
  const local = getState()
  const myEpoch = epoch
  const result = await F.runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.exists() ? snap.data() : null
    const cloudEpoch = typeof data?.epoch === 'number' ? data.epoch : 0
    if (data && cloudEpoch > myEpoch) {
      // Progress was erased or replaced on another device after this one loaded: that wins.
      return { state: sanitize(data), epoch: cloudEpoch, wrote: false }
    }
    const next = data && cloudEpoch === myEpoch ? mergeStates(sanitize(data), local) : local
    tx.set(ref, { ...next, epoch: myEpoch, v: 1, updatedAt: F.serverTimestamp() })
    return { state: next, epoch: myEpoch, wrote: true }
  })
  if (currentUid !== uid) return
  if (result.epoch !== epoch) {
    epoch = result.epoch
    writeEpoch(uid, epoch)
  }
  // Anything learned while the save was in flight stays dirty and is merged next time.
  const changedMeanwhile = !same(getState(), local)
  if (!changedMeanwhile && !same(result.state, local)) switchProfile(userKey(uid), result.state)
  else if (changedMeanwhile && !same(result.state, local)) switchProfile(userKey(uid), mergeStates(result.state, getState()))
  dirty = changedMeanwhile
  set({ sync: dirty ? 'saving' : 'saved', savedAt: Date.now() })
  if (dirty) scheduleSave()
}

function scheduleSave() {
  if (!currentUid) return
  dirty = true
  if (loadedUid !== currentUid) return // saved once the cloud copy has loaded
  set({ sync: 'saving' })
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => void flush(), SAVE_DELAY)
}

let inflight: Promise<void> | null = null

/** Save now. Saves run one at a time; resolves true when nothing is left unsaved. */
export async function flush(): Promise<boolean> {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  for (let round = 0; round < 3; round++) {
    if (inflight) await inflight.catch(() => undefined)
    const uid = currentUid
    if (!uid || !dirty) return true
    if (loadedUid !== uid) return false
    inflight = writeCloud(uid)
    try {
      await inflight
    } catch {
      set({ sync: navigator.onLine ? 'error' : 'offline' })
      return false
    } finally {
      inflight = null
    }
    if (saveTimer) clearTimeout(saveTimer) // a follow-up save is handled by this loop
    saveTimer = null
  }
  return !dirty
}

/** Erase / Import replace progress outright: newer than any copy on other devices. */
export async function markReplaced(): Promise<boolean> {
  if (!currentUid) return true
  epoch = Date.now()
  writeEpoch(currentUid, epoch)
  dirty = true
  return flush()
}

export function hasUnsaved(): boolean {
  return !!currentUid && dirty
}

onProgressChange(() => scheduleSave())
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (currentUid && loadedUid !== currentUid) return void restore(currentUid)
    if (currentUid && dirty) void flush()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
  window.addEventListener('pagehide', () => void flush())
}

/** Merge changes made on other devices into this one as they arrive. */
async function listen(uid: string) {
  const { db, F } = await fb()
  unlisten?.()
  unlisten = F.onSnapshot(
    F.doc(db, ...docPath(uid)),
    (snap) => {
      if (currentUid !== uid || !snap.exists() || snap.metadata.hasPendingWrites) return
      const data = snap.data()
      const remoteEpoch = typeof data.epoch === 'number' ? data.epoch : 0
      const remote = sanitize(data)
      if (remoteEpoch > epoch) {
        // Erased or replaced elsewhere: adopt it.
        epoch = remoteEpoch
        writeEpoch(uid, epoch)
        dirty = false
        switchProfile(userKey(uid), remote)
      } else if (remoteEpoch === epoch) {
        const merged = mergeStates(remote, getState())
        if (!same(merged, getState())) switchProfile(userKey(uid), merged)
      }
    },
    () => undefined,
  )
}

/** Restore the account's progress from the cloud, merged with this device's copies. */
async function restore(uid: string) {
  const { db, F } = await fb()
  set({ sync: 'loading' })
  const cached = loadFrom(userKey(uid))
  epoch = readEpoch(uid)
  let cloud: State | null = null
  let cloudEpoch = 0
  try {
    const snap = await F.getDoc(F.doc(db, ...docPath(uid)))
    if (snap.exists()) {
      cloud = sanitize(snap.data())
      cloudEpoch = typeof snap.data().epoch === 'number' ? snap.data().epoch : 0
    }
  } catch {
    // Couldn't reach the cloud: show this device's copy, but don't write until the cloud copy loads.
    if (currentUid === uid) {
      switchProfile(userKey(uid), cached)
      set({ sync: navigator.onLine ? 'error' : 'offline' })
    }
    return
  }
  if (currentUid !== uid) return
  // A newer erase/import in the cloud replaces this device's cached copy.
  let next: State
  if (cloud && cloudEpoch > epoch) {
    epoch = cloudEpoch
    next = cloud
  } else if (cloud && cloudEpoch === epoch) next = mergeStates(cloud, cached)
  else next = cached // no cloud copy yet, or this device erased/imported more recently
  writeEpoch(uid, epoch)
  let notice = ''
  // Progress made before signing in on this device, including anything learned while this sign-in was
  // loading (it was written to the guest copy), joins the account once; then the guest copy is cleared.
  const guest = loadFrom(GUEST_KEY)
  if (hasProgress(guest) || dirty) {
    next = mergeStates(mergeStates(next, guest), getState())
    try {
      localStorage.removeItem(GUEST_KEY)
    } catch {
      /* ignore */
    }
    if (hasProgress(guest)) notice = 'The progress you made before signing in has been added to your account.'
  }
  loadedUid = uid
  switchProfile(userKey(uid), next)
  set({ notice })
  void listen(uid)
  if (!cloud || !same(cloud, next) || cloudEpoch !== epoch) {
    dirty = true
    await flush()
  } else set({ sync: 'saved', savedAt: Date.now() })
}

function stopSync() {
  unlisten?.()
  unlisten = null
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  currentUid = null
  loadedUid = null
  dirty = false
  epoch = 0
}

// ---------- auth lifecycle ----------
export function startAccount() {
  void fb().then(({ auth, A }) => {
    A.onAuthStateChanged(auth, (u) => {
      if (u) {
        const provider = u.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'
        const changedUser = currentUid !== u.uid
        if (changedUser) stopSync()
        currentUid = u.uid
        set({ ready: true, user: { uid: u.uid, email: u.email, name: u.displayName, provider, verified: u.emailVerified } })
        if (changedUser) void restore(u.uid)
      } else {
        const uid = currentUid
        stopSync()
        if (uid) {
          clearLocal(uid)
          switchProfile(GUEST_KEY, loadFrom(GUEST_KEY))
        }
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
  'auth/user-mismatch': 'That’s a different account. Use the account you’re signed in with.',
  'auth/requires-recent-login': 'For your security, confirm it’s you first.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/popup-closed-by-user': 'The Google window was closed before signing in finished.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain': 'Google sign-in isn’t enabled for this web address yet.',
  'auth/operation-not-allowed': 'This sign-in method isn’t enabled yet.',
  unsaved: 'Some progress hasn’t been saved yet. Connect to the internet first.',
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

/**
 * Save anything pending, then sign out and remove this account's progress from the browser.
 * If progress couldn't be saved (e.g. offline) it refuses unless `force` is set, so nothing is lost silently.
 */
export async function signOutUser(force = false): Promise<{ ok: true } | { ok: false; reason: 'unsaved' }> {
  const { auth, A } = await fb()
  const saved = await flush()
  if (!saved && !force) return { ok: false, reason: 'unsaved' }
  await A.signOut(auth) // onAuthStateChanged clears local data and switches to the guest profile
  set({ notice: '' })
  return { ok: true }
}

/**
 * Permanently delete the account: confirms identity (password or Google), deletes the progress
 * document, then the login itself, and clears this browser's copy.
 */
export async function deleteAccount(password?: string) {
  const { auth, db, A, F } = await fb()
  const u = auth.currentUser
  if (!u) return
  const google = u.providerData.some((p) => p.providerId === 'google.com')
  if (google) {
    const provider = new A.GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await A.reauthenticateWithPopup(u, provider)
  } else {
    if (!password) throw { code: 'auth/missing-password' }
    await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email ?? '', password))
  }
  const uid = u.uid
  unlisten?.()
  unlisten = null
  if (saveTimer) clearTimeout(saveTimer)
  dirty = false
  await F.deleteDoc(F.doc(db, ...docPath(uid)))
  await A.deleteUser(u)
  clearLocal(uid)
}

export function clearNotice() {
  set({ notice: '' })
}

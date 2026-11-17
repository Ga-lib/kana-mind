import { useSyncExternalStore } from 'react'
import { BY_ID } from '../data'

// Leitner-style spaced repetition. Box 0 = new, box 6 = mastered.
const INTERVAL_DAYS = [0, 0.0007, 1, 3, 7, 16, 35] // box 1 ≈ 1 minute
const KEY = 'kanamind:v1'

export interface Card {
  box: number
  due: number
  seen: number
  right: number
  wrong: number
}

export interface State {
  cards: Record<string, Card>
  notes: Record<string, string>
  streak: { last: string; count: number }
  xp: number
  history: Record<string, number> // yyyy-mm-dd -> answers
}

const empty: State = { cards: {}, notes: {}, streak: { last: '', count: 0 }, xp: 0, history: {} }

export const MAX_IMPORT_BYTES = 1_000_000
const MAX_NOTE = 1000
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, min: number, max: number, fallback = 0) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

// Rebuild state from untrusted JSON (localStorage or an imported file): only known
// character ids and well-typed, bounded fields survive. Unknown keys are dropped.
export function sanitize(input: unknown): State {
  if (!isObj(input)) return empty
  const cards: Record<string, Card> = {}
  if (isObj(input.cards)) {
    for (const [id, c] of Object.entries(input.cards)) {
      if (!BY_ID.has(id) || !isObj(c)) continue
      cards[id] = {
        box: Math.round(num(c.box, 0, 6)),
        due: num(c.due, 0, 8.64e15),
        seen: Math.round(num(c.seen, 0, 1e7)),
        right: Math.round(num(c.right, 0, 1e7)),
        wrong: Math.round(num(c.wrong, 0, 1e7)),
      }
    }
  }
  const notes: Record<string, string> = {}
  if (isObj(input.notes)) {
    for (const [id, n] of Object.entries(input.notes)) {
      if (BY_ID.has(id) && typeof n === 'string') notes[id] = n.slice(0, MAX_NOTE)
    }
  }
  const history: Record<string, number> = {}
  if (isObj(input.history)) {
    for (const [d, n] of Object.entries(input.history)) {
      if (DATE_RE.test(d)) history[d] = Math.round(num(n, 0, 1e6))
    }
  }
  const s = isObj(input.streak) ? input.streak : {}
  return {
    cards,
    notes,
    history,
    streak: {
      last: typeof s.last === 'string' && DATE_RE.test(s.last) ? s.last : '',
      count: Math.round(num(s.count, 0, 1e5)),
    },
    xp: Math.round(num(input.xp, 0, 1e9)),
  }
}

// Where progress is cached in this browser: the guest key, or one key per signed-in account.
export const GUEST_KEY = KEY
let storageKey = KEY

export function loadFrom(key: string): State {
  try {
    const raw = localStorage.getItem(key)
    if (raw && raw.length <= MAX_IMPORT_BYTES) return sanitize(JSON.parse(raw))
  } catch {
    /* storage unavailable or corrupt */
  }
  return empty
}

let state: State = loadFrom(KEY)
const listeners = new Set<() => void>()
const changeListeners = new Set<(s: State) => void>()

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

/** A learner action changed progress: cache it locally and tell the cloud sync. */
function save(next: State) {
  state = next
  persist()
  listeners.forEach((l) => l())
  changeListeners.forEach((l) => l(state))
}

/** Swap in another profile's progress (sign-in / sign-out) without triggering a cloud write. */
export function switchProfile(key: string, next: State) {
  storageKey = key
  state = next
  persist()
  listeners.forEach((l) => l())
}

export function onProgressChange(cb: (s: State) => void): () => void {
  changeListeners.add(cb)
  return () => changeListeners.delete(cb)
}

export function getState(): State {
  return state
}

export function hasProgress(s: State): boolean {
  return Object.keys(s.cards).length > 0 || Object.keys(s.notes).length > 0 || s.xp > 0
}

/** Combine two copies of progress (e.g. this device and the cloud) without losing either side's learning. */
export function mergeStates(a: State, b: State): State {
  const cards: Record<string, Card> = { ...a.cards }
  for (const [id, c] of Object.entries(b.cards)) {
    const x = cards[id]
    if (!x || c.seen > x.seen || (c.seen === x.seen && c.due > x.due)) cards[id] = c
  }
  const notes: Record<string, string> = { ...b.notes }
  for (const [id, n] of Object.entries(a.notes)) if (n) notes[id] = n
  const history: Record<string, number> = { ...a.history }
  for (const [d, n] of Object.entries(b.history)) history[d] = Math.max(history[d] ?? 0, n)
  const streak =
    a.streak.last === b.streak.last
      ? { last: a.streak.last, count: Math.max(a.streak.count, b.streak.count) }
      : a.streak.last > b.streak.last
        ? a.streak
        : b.streak
  return { cards, notes, history, streak, xp: Math.max(a.xp, b.xp) }
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export const today = () => new Date().toISOString().slice(0, 10)

export function getCard(id: string): Card | undefined {
  return state.cards[id]
}

export function record(id: string, correct: boolean, easy = false) {
  if (!BY_ID.has(id)) return
  const now = Date.now()
  const prev = state.cards[id] ?? { box: 0, due: now, seen: 0, right: 0, wrong: 0 }
  const box = correct ? Math.min(6, prev.box + (easy ? 2 : 1)) : 1
  const card: Card = {
    box,
    due: now + INTERVAL_DAYS[box] * 86400000,
    seen: prev.seen + 1,
    right: prev.right + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
  }
  const d = today()
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streak =
    state.streak.last === d
      ? state.streak
      : { last: d, count: state.streak.last === y ? state.streak.count + 1 : 1 }
  save({
    ...state,
    cards: { ...state.cards, [id]: card },
    xp: state.xp + (correct ? 10 : 2),
    streak,
    history: { ...state.history, [d]: (state.history[d] ?? 0) + 1 },
  })
}

export function setNote(id: string, text: string) {
  if (!BY_ID.has(id)) return
  save({ ...state, notes: { ...state.notes, [id]: text.slice(0, MAX_NOTE) } })
}

export function resetProgress() {
  save(empty)
}

export function exportProgress(): string {
  return JSON.stringify({ app: 'kanamind', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 1)
}

// Throws if the file is too large or not JSON; otherwise keeps only valid fields.
export function importProgress(json: string): number {
  if (json.length > MAX_IMPORT_BYTES) throw new Error('too large')
  const next = sanitize(JSON.parse(json))
  save(next)
  return Object.keys(next.cards).length
}

export function dueIds(ids: string[]): string[] {
  const now = Date.now()
  return ids.filter((id) => {
    const c = state.cards[id]
    return c && c.due <= now && c.box < 7
  })
}

export function mastery(ids: string[]): { learned: number; mastered: number } {
  let learned = 0
  let mastered = 0
  for (const id of ids) {
    const c = state.cards[id]
    if (!c) continue
    if (c.box >= 2) learned++
    if (c.box >= 5) mastered++
  }
  return { learned, mastered }
}

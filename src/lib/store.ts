import { useSyncExternalStore } from 'react'

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

interface State {
  cards: Record<string, Card>
  notes: Record<string, string>
  streak: { last: string; count: number }
  xp: number
  history: Record<string, number> // yyyy-mm-dd -> answers
}

const empty: State = { cards: {}, notes: {}, streak: { last: '', count: 0 }, xp: 0, history: {} }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable */
  }
  return empty
}

let state: State = load()
const listeners = new Set<() => void>()

function save(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
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
  save({ ...state, notes: { ...state.notes, [id]: text } })
}

export function resetProgress() {
  save(empty)
}

export function exportProgress(): string {
  return JSON.stringify(state)
}

export function importProgress(json: string) {
  save({ ...empty, ...JSON.parse(json) })
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

import { hiragana, katakana, GROUPS, LOOKALIKES } from './kana'
import { kanji, KANJI_GROUPS } from './kanji'
import type { Item, Script } from './types'

export const ALL: Item[] = [...hiragana, ...katakana, ...kanji]
export const BY_ID = new Map(ALL.map((i) => [i.id, i]))
export const BY_CHAR = new Map(ALL.map((i) => [i.char, i]))

export function itemsOf(script: Script): Item[] {
  return script === 'hiragana' ? hiragana : script === 'katakana' ? katakana : kanji
}

export function groupsOf(script: Script): { key: string; label: string }[] {
  return script === 'kanji' ? KANJI_GROUPS.map(({ key, label }) => ({ key, label })) : GROUPS
}

export { hiragana, katakana, kanji, LOOKALIKES }
export type { Item, Script }

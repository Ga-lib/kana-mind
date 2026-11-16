import { hiragana, katakana, GROUPS, LOOKALIKES } from './kana'
import { kanji as handKanji, KANJI_GROUPS } from './kanji'
import { extraKanji, KANA_KANJI_ART, LEVEL_OF, partsOf } from './jlpt'
import type { Item, Level, Script } from './types'

// Hand-written kanji get their JLPT level, parts and line art from the dataset.
const hand: Item[] = handKanji.map((k) => ({
  ...k,
  level: LEVEL_OF.get(k.char) ?? 'n5',
  parts: partsOf(k.char),
  art: KANA_KANJI_ART[k.char],
}))
const extra = extraKanji(new Set(hand.map((k) => k.char)))
const kanji: Item[] = [...hand, ...extra.items]

const withArt = (list: Item[]) => list.map((i) => (KANA_KANJI_ART[i.char] ? { ...i, art: KANA_KANJI_ART[i.char] } : i))
const hira = withArt(hiragana)
const kata = withArt(katakana)

export type Group = { key: string; label: string; level?: Level }
const KANJI_GROUP_LIST: Group[] = [
  ...KANJI_GROUPS.map(({ key, label }) => ({ key, label: `N5 ${label.toLowerCase()}`, level: 'n5' as Level })),
  ...extra.groups,
]

export const ALL: Item[] = [...hira, ...kata, ...kanji]
export const BY_ID = new Map(ALL.map((i) => [i.id, i]))
export const BY_CHAR = new Map(ALL.map((i) => [i.char, i]))

export function itemsOf(script: Script): Item[] {
  return script === 'hiragana' ? hira : script === 'katakana' ? kata : kanji
}

export function groupsOf(script: Script): Group[] {
  return script === 'kanji' ? KANJI_GROUP_LIST : GROUPS
}

export { hira as hiragana, kata as katakana, kanji, LOOKALIKES }
export type { Item, Script, Level }

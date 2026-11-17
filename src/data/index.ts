import { hiragana, katakana, GROUPS, LOOKALIKES } from './kana'
import { kanji as handKanji, KANJI_GROUPS } from './kanji'
import { extraKanji, KANA_KANJI_ART, LEVEL_OF, partsOf } from './jlpt'
import type { Item, Level, Script } from './types'

// Hand-written kanji get their JLPT level, parts and line art from the dataset (Waller's N5–N3 lists).
// Kanji whose level is N4 or N3 move out of the N5 theme groups into a picture-story set for their level.
// 分 is not on Waller's N5–N3 lists (most textbooks teach it at N5), so it stays with N5.
const hand: Item[] = handKanji.map((k) => {
  const level: Level = LEVEL_OF.get(k.char) ?? 'n5'
  return {
    ...k,
    level,
    group: level === 'n5' ? k.group : `${level}-stories`,
    parts: partsOf(k.char),
    art: KANA_KANJI_ART[k.char],
  }
})
const extra = extraKanji(new Set(hand.map((k) => k.char)))
const kanji: Item[] = [...hand, ...extra.items]

const withArt = (list: Item[]) => list.map((i) => (KANA_KANJI_ART[i.char] ? { ...i, art: KANA_KANJI_ART[i.char] } : i))
const hira = withArt(hiragana)
const kata = withArt(katakana)

export type Group = { key: string; label: string; level?: Level }
const storyGroups: Group[] = (['n4', 'n3'] as Level[])
  .filter((l) => hand.some((k) => k.level === l))
  .map((l) => ({ key: `${l}-stories`, label: `${l.toUpperCase()} picture stories`, level: l }))
const themeGroups: Group[] = KANJI_GROUPS.filter((g) => hand.some((k) => k.group === g.key)).map(({ key, label }) => ({
  key,
  label: `N5 ${label.toLowerCase()}`,
  level: 'n5' as Level,
}))
const KANJI_GROUP_LIST: Group[] = [
  ...themeGroups,
  ...extra.groups.filter((g) => g.level === 'n5'),
  ...storyGroups.filter((g) => g.level === 'n4'),
  ...extra.groups.filter((g) => g.level === 'n4'),
  ...storyGroups.filter((g) => g.level === 'n3'),
  ...extra.groups.filter((g) => g.level === 'n3'),
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

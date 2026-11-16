// JLPT N5–N3 kanji built from scripts/build-data.mjs output.
// The 97 hand-written kanji (with custom stories and drawings) keep their entries; the rest of the
// 612 get a parts-based story: the building blocks KanjiVG identifies, combined into the meaning.
import RAW from './jlpt/kanji.json'
import ART from './art.json'
import type { Item, Level } from './types'
import { kataToHira, toRomaji } from './kanji'

interface Raw {
  c: string
  l: Level
  m: string
  on: string[]
  kun: string[]
  parts: [string, string][]
  ex: { w: string; r: string; m: string }[]
  p: string
  n: number
}

const raw = RAW as Raw[]
export const LEVEL_OF = new Map(raw.map((k) => [k.c, k.l]))
export const KANA_KANJI_ART = ART as Record<string, string>

export const LEVEL_LABEL: Record<Level, string> = { n5: 'N5', n4: 'N4', n3: 'N3' }
const SET_SIZE = 24

function story(k: Raw): string {
  const meaning = k.m.split(',')[0]
  const parts = k.parts.filter(([p]) => p !== k.c)
  if (parts.length >= 2) {
    const list = parts.map(([p, m]) => `${p} ${m}`).join(' + ')
    return `Built from ${list}. Picture the ${parts.map(([, m]) => m).join(' and the ')} together making “${meaning}”, and make the scene as vivid and silly as you can.`
  }
  if (parts.length === 1) return `Contains ${parts[0][0]} (${parts[0][1]}). Picture a ${parts[0][1]} that turns into “${meaning}”.`
  return `A picture-like shape: look for “${meaning}” in its lines, and write it out while saying the reading.`
}

export function extraKanji(existing: Set<string>): { items: Item[]; groups: { key: string; label: string; level: Level }[] } {
  const items: Item[] = []
  const groups: { key: string; label: string; level: Level }[] = []
  for (const level of ['n5', 'n4', 'n3'] as Level[]) {
    const list = raw.filter((k) => k.l === level && !existing.has(k.c))
    for (let i = 0; i < list.length; i += SET_SIZE) {
      const key = `${level}-${i / SET_SIZE + 1}`
      const chunk = list.slice(i, i + SET_SIZE)
      groups.push({ key, label: `${LEVEL_LABEL[level]} set ${i / SET_SIZE + 1}`, level })
      for (const k of chunk) {
        const reading = (k.kun[0] ?? kataToHira(k.on[0] ?? '')).replace(/[()]/g, '')
        items.push({
          id: `k-${k.c}`,
          script: 'kanji',
          char: k.c,
          romaji: toRomaji(reading),
          group: key,
          keyword: k.m.split(',')[0],
          picture: '',
          art: k.p || undefined,
          mnemonic: story(k),
          meaning: k.m,
          on: k.on,
          kun: k.kun,
          examples: k.ex.length ? k.ex : undefined,
          parts: k.parts.filter(([p]) => p !== k.c),
          level,
          speak: k.ex[0]?.r ?? reading,
        })
      }
    }
  }
  return { items, groups }
}

export function partsOf(char: string): [string, string][] {
  return raw.find((k) => k.c === char)?.parts.filter(([p]) => p !== char) ?? []
}

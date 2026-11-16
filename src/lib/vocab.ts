import type { Level } from '../data'
import { kataToHira, toRomaji } from '../data/kanji'
import { hiraToKata } from './util'

export interface Word {
  id: string
  word: string // as usually written (kanji, kana or katakana)
  reading: string // as given by the list (hiragana, or katakana for loanwords)
  hiragana: string
  katakana: string
  romaji: string
  meaning: string
  hasKanji: boolean
  art: string
  level: Level
}

const cache = new Map<Level, Promise<Word[]>>()
const loaders: Record<Level, () => Promise<{ default: unknown }>> = {
  n5: () => import('../data/jlpt/vocab-n5.json'),
  n4: () => import('../data/jlpt/vocab-n4.json'),
  n3: () => import('../data/jlpt/vocab-n3.json'),
}

// Loaded per level, on demand, as separate chunks.
export function loadVocab(level: Level): Promise<Word[]> {
  if (!cache.has(level)) {
    cache.set(
      level,
      loaders[level]().then((m) =>
        (m.default as [string, string, string, string][]).map(([word, reading, meaning, art], i) => {
          const hira = kataToHira(reading)
          return {
            id: `${level}-${i}`,
            word,
            reading,
            hiragana: hira,
            katakana: hiraToKata(hira),
            romaji: toRomaji(hira.replace(/[～〜]/g, '')),
            meaning,
            hasKanji: /[一-鿿]/.test(word),
            art,
            level,
          }
        }),
      ),
    )
  }
  return cache.get(level)!
}

export type Script = 'hiragana' | 'katakana' | 'kanji'
export type Level = 'n5' | 'n4' | 'n3'

export interface Example {
  w: string // word
  r: string // reading in kana
  m: string // meaning
}

export interface Item {
  id: string
  script: Script
  char: string
  romaji: string // for kanji: main reading in romaji
  group: string
  keyword: string // the picture word the mnemonic hangs on
  picture: string // emoji image the story is built around
  mnemonic: string
  tip?: string
  speak: string // text sent to the speech engine
  // kanji only
  meaning?: string
  on?: string[]
  kun?: string[]
  examples?: Example[]
  parts?: [string, string][] // kanji building blocks: [part, meaning]
  level?: Level // JLPT level
  art?: string // OpenMoji line-art file id in /art
}

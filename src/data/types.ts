export type Script = 'hiragana' | 'katakana' | 'kanji'

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
  mnemonic: string
  tip?: string
  speak: string // text sent to the speech engine
  // kanji only
  meaning?: string
  on?: string[]
  kun?: string[]
  examples?: Example[]
  parts?: string
}

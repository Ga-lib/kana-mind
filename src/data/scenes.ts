import { HIRAGANA_SCENES, KATAKANA_SCENES } from './scenes-kana'
import { KANJI_SCENES } from './scenes-kanji'

// Character -> drawn memory scene (see components/Illustration.tsx for the mini-language).
export const SCENES: Record<string, string[]> = { ...HIRAGANA_SCENES, ...KATAKANA_SCENES, ...KANJI_SCENES }

# KanaMind

Learn **Hiragana, Katakana and Kanji** with picture mnemonics, audio, animated stroke order, a writing pad and spaced repetition.

## Features

- **Picture stories** for all 46 hiragana, 46 katakana and 95 JLPT N5 kanji, plus dakuten (が, ぱ…) and combos (きゃ…)
- **Pronunciation**: native Japanese voice through the browser (normal and slow), a 🎤 *Say it* microphone check (Chrome/Edge), and a guide to the tricky sounds (ふ, つ, R, long vowels, small っ, particles)
- **Stroke order** animations from [KanjiVG](https://kanjivg.tagaini.net) and a **tracing pad** to write each character yourself
- **Lessons** that walk a row one character at a time, then quiz it
- **Quizzes**: see → choose / type the sound, sound → character, listening, kanji meaning and reading
- **Spaced repetition** (Leitner boxes): misses come back in a minute, known characters are spaced out to days and weeks
- **Look-alike drill** for シ/ツ, ソ/ン, ね/れ/わ, ぬ/め and more
- **Your own mnemonics**: write a personal story for any character
- Streak, XP, daily goal, export/import progress. Works on phones, light and dark mode.

Everything runs in the browser. Progress is stored in `localStorage`; no account, no server costs.

## Tech

React 18 + TypeScript + Vite, plain CSS, Web Speech API. Deployed as a static site on Vercel (free tier).

```bash
npm install
npm run dev
```

## Credits

Stroke order data: KanjiVG © Ulrich Apel, CC BY-SA 3.0. Fonts: Klee One and Zen Maru Gothic (Google Fonts, OFL).

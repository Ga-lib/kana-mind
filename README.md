# KanaMind

Learn **Hiragana, Katakana and Kanji** with picture stories, native audio, animated stroke order, a writing pad and spaced repetition.

## Features

- **Picture stories** for all 46 hiragana, 46 katakana and 97 JLPT N5 kanji, each stamped with its picture word, plus dakuten (が, ぱ…) and combos (きゃ…)
- **Pronunciation**: native Japanese voice through the browser (normal and slow), a *Say it* microphone check (Chrome/Edge), and a guide to the tricky sounds (ふ, つ, R, long vowels, small っ, particles)
- **Stroke order** animations from [KanjiVG](https://kanjivg.tagaini.net) and a **tracing pad** to write each character yourself
- **Lessons** that walk a row one character at a time, then quiz it
- **Quizzes**: see → choose / type the sound, sound → character, listening, kanji meaning and reading
- **Spaced repetition** (Leitner boxes): misses come back in a minute, known characters are spaced out to days and weeks
- **Look-alike drill** for シ/ツ, ソ/ン, ね/れ/わ, ぬ/め and more
- **Your own mnemonics**: write a personal story for any character
- Streak, XP, daily goal, export/import progress. Works on phones, light and dark mode.

Everything runs in the browser. Progress is stored in `localStorage`; no account, no server costs.

## Tech

React 18 + TypeScript + Vite 6, plain CSS, a custom SVG icon set, self-hosted fonts (Shippori Mincho, Zen Kaku Gothic New, Klee One via Fontsource), Web Speech API. Deployed as a static site on Vercel (free tier).

## Security

- Static site with no server code, accounts or secrets, so there is no backend to attack.
- Strict security headers in `vercel.json`: a Content-Security-Policy allowing only same-origin scripts, styles and fonts plus the two pinned stroke-data hosts; `frame-ancestors none`, HSTS, `nosniff`, a referrer policy, and a Permissions-Policy that allows only the microphone, on this site only.
- `npm run preview` serves the same headers, so CSP problems show up locally.
- Saved and imported progress is treated as untrusted: size-capped, then rebuilt field by field (known character ids only, bounded numbers, capped note length).
- Stroke SVGs come from a pinned KanjiVG release, are size-capped, parsed as inert XML, and only path data matching a strict pattern is rendered.
- No third-party fonts, analytics or trackers.

## Run locally

```bash
npm install
npm run dev
```

## Credits

Stroke order data: KanjiVG © Ulrich Apel, CC BY-SA 3.0. Fonts: Shippori Mincho, Zen Kaku Gothic New and Klee One (SIL OFL), self-hosted via Fontsource.

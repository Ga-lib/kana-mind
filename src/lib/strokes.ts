// Bundled KanjiVG stroke data (CC BY-SA 3.0, Ulrich Apel). Two lazy chunks:
// the kana + hand-drawn lesson kanji (small, used everywhere) and the full N5–N3 kanji set.
type Strokes = Record<string, string[]>
let core: Promise<Strokes> | null = null
let jlpt: Promise<Strokes> | null = null

export async function localStrokes(char: string): Promise<string[] | null> {
  core ??= import('../data/strokes.json').then((m) => m.default as Strokes)
  const a = await core
  if (a[char]) return a[char]
  if (!/[一-鿿]/.test(char)) return null
  jlpt ??= import('../data/jlpt/kanji-strokes.json').then((m) => m.default as Strokes)
  return (await jlpt)[char] ?? null
}

// Bundled KanjiVG stroke data (CC BY-SA 3.0, Ulrich Apel) for every character that has a lesson card.
// Loaded lazily as its own chunk, so the first page load stays small.
let data: Promise<Record<string, string[]>> | null = null

function load() {
  data ??= import('../data/strokes.json').then((m) => m.default as Record<string, string[]>)
  return data
}

export async function localStrokes(char: string): Promise<string[] | null> {
  const all = await load()
  return all[char] ?? null
}

import { useEffect, useState } from 'react'

// Stroke data: KanjiVG (CC BY-SA 3.0, Ulrich Apel) — https://kanjivg.tagaini.net
const SRC = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@r20260714/kanji/'
const FALLBACK = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/'
const cache = new Map<string, Promise<string[] | null>>()

function fileName(ch: string) {
  return ch.codePointAt(0)!.toString(16).padStart(5, '0') + '.svg'
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url)
    return r.ok ? await r.text() : null
  } catch {
    return null
  }
}

function loadStrokes(ch: string): Promise<string[] | null> {
  if (!cache.has(ch)) {
    cache.set(
      ch,
      (async () => {
        const f = fileName(ch)
        const text = (await fetchText(SRC + f)) ?? (await fetchText(FALLBACK + f))
        if (!text) return null
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
        const paths = Array.from(doc.querySelectorAll('path'))
          .filter((p) => (p.getAttribute('id') ?? '').includes('-s'))
          .map((p) => p.getAttribute('d') ?? '')
        return paths.length ? paths : null
      })(),
    )
  }
  return cache.get(ch)!
}

function startPoint(d: string): [number, number] {
  const m = d.match(/[Mm]\s*([\d.]+)[ ,]*([\d.]+)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0]
}

export default function StrokeOrder({ char, size = 220 }: { char: string; size?: number }) {
  const ch = [...char][0]
  const [strokes, setStrokes] = useState<string[] | null | undefined>(undefined)
  const [run, setRun] = useState(0)
  const [showNums, setShowNums] = useState(true)

  useEffect(() => {
    let alive = true
    setStrokes(undefined)
    loadStrokes(ch).then((s) => alive && setStrokes(s))
    return () => {
      alive = false
    }
  }, [ch])

  if (strokes === undefined) return <div className="stroke-box muted" style={{ width: size, height: size }}>Loading strokes…</div>
  if (strokes === null)
    return (
      <div className="stroke-box muted" style={{ width: size, height: size }}>
        Stroke data unavailable offline
      </div>
    )

  const per = 0.55
  return (
    <div className="stroke-wrap">
      <svg key={run} className="stroke-box" viewBox="0 0 109 109" width={size} height={size} aria-label={`Stroke order for ${ch}`}>
        <line x1="54.5" y1="0" x2="54.5" y2="109" className="guide" />
        <line x1="0" y1="54.5" x2="109" y2="54.5" className="guide" />
        {strokes.map((d, i) => (
          <path key={'g' + i} d={d} className="ghost" />
        ))}
        {strokes.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="ink"
            style={{ animationDelay: `${i * per}s`, animationDuration: `${per * 0.9}s` }}
          />
        ))}
        {showNums &&
          strokes.map((d, i) => {
            const [x, y] = startPoint(d)
            return (
              <g key={'n' + i} className="num" style={{ animationDelay: `${i * per}s` }}>
                <circle cx={x} cy={y} r="5" />
                <text x={x} y={y + 2.4} textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            )
          })}
      </svg>
      <div className="row gap-s center">
        <button className="btn small" onClick={() => setRun((r) => r + 1)}>↻ Replay</button>
        <button className="btn small ghost-btn" onClick={() => setShowNums((s) => !s)}>
          {showNums ? 'Hide' : 'Show'} numbers
        </button>
        <span className="muted small-text">{strokes.length} strokes</span>
      </div>
    </div>
  )
}

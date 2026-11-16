import { useEffect, useState } from 'react'
import Icon from './Icon'

// Stroke data: KanjiVG (CC BY-SA 3.0, Ulrich Apel) — https://kanjivg.tagaini.net
// Both sources are pinned to the same release tag so the content cannot change underneath us.
const TAG = 'r20260714'
const SOURCES = [
  `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@${TAG}/kanji/`,
  `https://raw.githubusercontent.com/KanjiVG/kanjivg/${TAG}/kanji/`,
]
const MAX_SVG_BYTES = 200_000
// Only SVG path commands, numbers and separators are accepted from the remote file.
const PATH_RE = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{1,4000}$/
const cache = new Map<string, Promise<string[] | null>>()

function fileName(ch: string) {
  return ch.codePointAt(0)!.toString(16).padStart(5, '0') + '.svg'
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer', mode: 'cors' })
    if (!r.ok) return null
    const text = await r.text()
    return text.length <= MAX_SVG_BYTES ? text : null
  } catch {
    return null
  }
}

function loadStrokes(ch: string): Promise<string[] | null> {
  if (!/^[぀-ヿ一-鿿]$/.test(ch)) return Promise.resolve(null)
  if (!cache.has(ch)) {
    cache.set(
      ch,
      (async () => {
        const f = fileName(ch)
        let text: string | null = null
        for (const src of SOURCES) {
          text = await fetchText(src + f)
          if (text) break
        }
        if (!text) return null
        // Parsed as inert XML (scripts never run in a DOMParser document); we only read `d` strings.
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
        if (doc.querySelector('parsererror')) return null
        const paths = Array.from(doc.querySelectorAll('path'))
          .filter((p) => /-s\d+$/.test(p.getAttribute('id') ?? ''))
          .map((p) => p.getAttribute('d') ?? '')
        return paths.length && paths.length <= 40 && paths.every((d) => PATH_RE.test(d)) ? paths : null
      })(),
    )
  }
  return cache.get(ch)!
}

function startPoint(d: string): [number, number] {
  const m = d.match(/[Mm]\s*([\d.]+)[ ,]*([\d.]+)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0]
}

export default function StrokeOrder({ char, size = 220, autoNumbers = true }: { char: string; size?: number; autoNumbers?: boolean }) {
  const ch = [...char][0]
  const [strokes, setStrokes] = useState<string[] | null | undefined>(undefined)
  const [run, setRun] = useState(0)
  const [showNums, setShowNums] = useState(autoNumbers)

  useEffect(() => {
    let alive = true
    setStrokes(undefined)
    loadStrokes(ch).then((s) => alive && setStrokes(s))
    return () => {
      alive = false
    }
  }, [ch])

  if (strokes === undefined)
    return (
      <div className="stroke-box square loading" style={{ width: size, height: size }}>
        <span className="sr-only">Loading stroke order</span>
      </div>
    )
  if (strokes === null)
    return (
      <div className="stroke-box square empty" style={{ width: size, height: size }}>
        <span className="glyph">{ch}</span>
        <span className="small-text muted">Stroke animation needs a connection</span>
      </div>
    )

  const per = 0.55
  return (
    <div className="stroke-wrap">
      <svg key={run} className="stroke-box square" viewBox="0 0 109 109" width={size} height={size} role="img" aria-label={`Stroke order for ${ch}, ${strokes.length} strokes`}>
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
                <text x={x} y={y + 2.3} textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            )
          })}
      </svg>
      <div className="row gap-s center">
        <button className="btn small" onClick={() => setRun((r) => r + 1)}>
          <Icon name="replay" size={16} /> Replay
        </button>
        <button className="btn small quiet" aria-pressed={showNums} onClick={() => setShowNums((s) => !s)}>
          {showNums ? 'Hide' : 'Show'} order numbers
        </button>
      </div>
      <span className="muted small-text">{strokes.length} strokes</span>
    </div>
  )
}

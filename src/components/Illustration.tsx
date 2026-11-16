import { useEffect, useState } from 'react'
import { SCENES } from '../data/scenes'
import { localStrokes } from '../lib/strokes'

/*
  A memory illustration in the style of a picture-mnemonic flashcard: the character's real strokes
  (KanjiVG, 109×109 grid) are drawn in ink and the scene around them is drawn in indigo and seal red,
  so the character becomes part of the picture.

  Scene mini-language, one entry per shape:
    [modifier]body     body = "c x y r" for a circle, otherwise SVG path data
    modifiers: none = indigo line, * = indigo line + soft fill, ! = red line + soft red fill,
               ^ = red line, # = solid ink, % = solid red, - = dashed indigo line
    "T x y size text"  a small label
*/

type Shape = { kind: 'path' | 'circle' | 'text'; cls: string; d?: string; c?: number[]; text?: string; size?: number }

const MOD: Record<string, string> = { '*': 'sc-soft', '!': 'sc-red', '^': 'sc-redline', '#': 'sc-ink', '%': 'sc-redfill', '-': 'sc-dash' }

function parse(entry: string): Shape {
  if (entry.startsWith('T ')) {
    const [, x, y, size, ...rest] = entry.split(' ')
    return { kind: 'text', cls: 'sc-text', c: [+x, +y], size: +size, text: rest.join(' ') }
  }
  const cls = MOD[entry[0]] ?? 'sc-line'
  const body = MOD[entry[0]] ? entry.slice(1) : entry
  if (body.startsWith('c ')) {
    const [x, y, r] = body.slice(2).trim().split(/\s+/).map(Number)
    return { kind: 'circle', cls, c: [x, y, r] }
  }
  return { kind: 'path', cls, d: body }
}

export function hasIllustration(char: string) {
  return char in SCENES
}

export default function Illustration({ char, size = 132, bare = false, animate = true }: { char: string; size?: number; bare?: boolean; animate?: boolean }) {
  const [strokes, setStrokes] = useState<string[] | null>(null)
  useEffect(() => {
    let alive = true
    setStrokes(null)
    localStrokes(char).then((s) => alive && setStrokes(s))
    return () => {
      alive = false
    }
  }, [char])

  const scene = SCENES[char]
  if (!scene) return null
  const shapes = scene.map(parse)

  return (
    <svg
      className={`illus ${bare ? 'bare' : ''} ${animate ? 'animate' : ''}`}
      viewBox="0 0 109 109"
      width={size}
      height={size}
      aria-hidden
      key={char}
    >
      <g className="sc">
        {shapes.map((s, i) => {
          const style = { animationDelay: `${0.05 * i}s` }
          const pl = s.cls === 'sc-dash' ? undefined : 1
          if (s.kind === 'circle') return <circle key={i} className={s.cls} cx={s.c![0]} cy={s.c![1]} r={s.c![2]} pathLength={pl} style={style} />
          if (s.kind === 'text')
            return (
              <text key={i} className={s.cls} x={s.c![0]} y={s.c![1]} fontSize={s.size} textAnchor="middle" style={style}>
                {s.text}
              </text>
            )
          return <path key={i} className={s.cls} d={s.d} pathLength={pl} style={style} />
        })}
      </g>
      <g className="glyph-strokes">
        {strokes
          ? strokes.map((d, i) => <path key={i} d={d} pathLength={1} style={{ animationDelay: `${0.35 + i * 0.3}s` }} />)
          : (
            <text x="54.5" y="88" textAnchor="middle" className="glyph-fallback">
              {char}
            </text>
          )}
      </g>
    </svg>
  )
}

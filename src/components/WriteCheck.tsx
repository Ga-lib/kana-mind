import { useCallback, useEffect, useRef, useState } from 'react'
import { loadStrokes } from './StrokeOrder'
import Icon from './Icon'
import { check, MEMORY, samplePath, TRACE, type Expected, type Pt, type Verdict } from '../lib/strokeMatch'
import { sfx, setSoundOn, soundOn } from '../lib/sound'
import { speak } from '../lib/speech'

export type WriteMode = 'trace' | 'memory'

interface CharData {
  char: string
  d: string[]
  exp: Expected[]
}

const REASON: Record<string, string> = {
  direction: 'Right line, wrong direction. Start from the other end.',
  shape: 'That shape doesn’t match this stroke. Try again.',
  position: 'Right idea, wrong place. Look at where this stroke sits.',
  length: 'Check the length of this stroke.',
  tiny: 'Draw the whole stroke in one movement.',
}

/**
 * Handwriting checker: the learner writes each stroke; every stroke is checked for shape, position,
 * direction and order as soon as the pen lifts. Passing needs every stroke right, first time, in order.
 */
export default function WriteCheck({
  text,
  speakText,
  size = 260,
  mode: modeProp,
  allowModeSwitch = true,
  onResult,
}: {
  text: string
  speakText?: string
  size?: number
  mode?: WriteMode
  allowModeSwitch?: boolean
  onResult?: (passed: boolean, mistakes: number) => void
}) {
  const [mode, setMode] = useState<WriteMode>(modeProp ?? 'trace')
  const [chars, setChars] = useState<CharData[] | null | undefined>(undefined)
  const [ci, setCi] = useState(0)
  const [si, setSi] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [miss, setMiss] = useState(0) // misses on the current stroke
  const [hint, setHint] = useState(0) // bump to replay the hint animation
  const [live, setLive] = useState<Pt[]>([])
  const [wrong, setWrong] = useState<{ pts: Pt[]; key: number } | null>(null)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<null | { passed: boolean; mistakes: number }>(null)
  const [sound, setSound] = useState(soundOn())
  const svgRef = useRef<SVGSVGElement>(null)
  const drawing = useRef<Pt[] | null>(null)

  useEffect(() => {
    if (modeProp) setMode(modeProp)
  }, [modeProp])

  // Load and sample stroke data for every character in the text (e.g. きゃ = き + ゃ).
  useEffect(() => {
    let alive = true
    setChars(undefined)
    Promise.all(
      [...text].map(async (char) => {
        const d = await loadStrokes(char)
        return d ? { char, d, exp: d.map(samplePath) } : null
      }),
    ).then((list) => alive && setChars(list.every(Boolean) ? (list as CharData[]) : null))
    return () => {
      alive = false
    }
  }, [text])

  const reset = useCallback(() => {
    setCi(0)
    setSi(0)
    setMistakes(0)
    setMiss(0)
    setLive([])
    setWrong(null)
    setResult(null)
    setMessage('')
  }, [])
  useEffect(reset, [text, mode, reset])

  const cur = chars?.[ci]
  const tol = mode === 'trace' ? TRACE : MEMORY

  const toGrid = (e: React.PointerEvent): Pt => {
    const r = svgRef.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * 109, ((e.clientY - r.top) / r.height) * 109]
  }

  const down = (e: React.PointerEvent) => {
    if (!cur || result) return
    e.preventDefault()
    try {
      svgRef.current!.setPointerCapture(e.pointerId)
    } catch {
      /* capture is a nicety; drawing works without it */
    }
    drawing.current = [toGrid(e)]
    setLive(drawing.current)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const p = toGrid(e)
    const last = drawing.current[drawing.current.length - 1]
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return
    drawing.current = [...drawing.current, p]
    setLive(drawing.current)
  }
  const up = () => {
    const pts = drawing.current
    drawing.current = null
    setLive([])
    if (!pts || !cur) return
    const v: Verdict = check(pts, cur.exp, si, tol)
    if (v.ok) {
      sfx.tick()
      setMiss(0)
      setMessage('')
      const nextSi = si + 1
      if (nextSi < cur.exp.length) {
        setSi(nextSi)
      } else if (ci + 1 < chars!.length) {
        setSi(nextSi)
        setTimeout(() => {
          setCi(ci + 1)
          setSi(0)
        }, 450)
      } else {
        setSi(nextSi)
        finish(mistakes)
      }
      return
    }
    sfx.miss()
    setMistakes((m) => m + 1)
    setWrong({ pts, key: Date.now() })
    const misses = miss + 1
    setMiss(misses)
    if (v.reason === 'order') setMessage(`That’s stroke ${v.actual + 1}. Write stroke ${si + 1} first.`)
    else setMessage(REASON[v.reason])
    if (misses >= 2) setHint((h) => h + 1)
  }

  function finish(m: number) {
    const passed = m === 0
    setTimeout(() => {
      setResult({ passed, mistakes: m })
      if (passed) {
        sfx.pass()
        setTimeout(() => speak(speakText ?? text), 450)
      } else sfx.fail()
      onResult?.(passed, m)
    }, 350)
  }

  const askHint = () => {
    setHint((h) => h + 1)
    // In memory mode a hint means it wasn't written from memory.
    if (mode === 'memory') setMistakes((m) => m + 1)
  }

  if (chars === undefined) return <div className="wc-box square loading" style={{ width: size, height: size }} aria-label="Loading stroke data" />
  if (chars === null || !cur)
    return (
      <div className="wc-box square empty" style={{ width: size, height: size }}>
        <span className="small-text muted">The writing check needs a connection for this character.</span>
      </div>
    )

  const total = cur.exp.length
  const nextStart = si < total ? cur.exp[si].pts[0] : null
  return (
    <div className="wc">
      <div className="wc-head">
        {allowModeSwitch && (
          <div className="seg wc-mode" role="tablist" aria-label="Writing mode">
            <button role="tab" aria-selected={mode === 'trace'} className={mode === 'trace' ? 'on' : ''} onClick={() => setMode('trace')}>
              Trace
            </button>
            <button role="tab" aria-selected={mode === 'memory'} className={mode === 'memory' ? 'on' : ''} onClick={() => setMode('memory')}>
              From memory
            </button>
          </div>
        )}
        <button
          className="icon-btn"
          aria-pressed={sound}
          aria-label={sound ? 'Mute feedback sounds' : 'Turn feedback sounds on'}
          onClick={() => {
            setSoundOn(!sound)
            setSound(!sound)
          }}
        >
          <Icon name={sound ? 'speaker' : 'slow'} size={18} />
        </button>
      </div>

      <div className="wc-stage" style={{ width: size, height: size }}>
        <svg
          ref={svgRef}
          className={`wc-box square ${result ? (result.passed ? 'passed' : 'failed') : ''}`}
          viewBox="0 0 109 109"
          width={size}
          height={size}
          role="img"
          aria-label={`Writing area for ${cur.char}. Stroke ${Math.min(si + 1, total)} of ${total}.`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {mode === 'trace' && cur.d.map((d, i) => <path key={'g' + i} d={d} className="wc-guide" />)}
          {cur.d.slice(0, si).map((d, i) => (
            <path key={'ok' + i} d={d} className="wc-ink" pathLength={1} />
          ))}
          {hint > 0 && si < total && <path key={'hint' + hint + si} d={cur.d[si]} className="wc-hint" pathLength={1} />}
          {nextStart && (mode === 'trace' || hint > 0) && !result && (
            <g className="wc-start" key={'s' + si}>
              <circle cx={nextStart[0]} cy={nextStart[1]} r="5" />
              <text x={nextStart[0]} y={nextStart[1] + 2.3} textAnchor="middle">{si + 1}</text>
            </g>
          )}
          {wrong && <polyline key={wrong.key} points={wrong.pts.map((p) => p.join(',')).join(' ')} className="wc-wrong" />}
          {live.length > 1 && <polyline points={live.map((p) => p.join(',')).join(' ')} className="wc-live" />}
        </svg>

        {result && (
          <div className={`wc-result ${result.passed ? 'ok' : 'no'}`} role="status">
            <span className="wc-badge">
              <Icon name={result.passed ? 'check' : 'cross'} size={30} />
            </span>
            <b>{result.passed ? 'OK' : 'Not OK'}</b>
            <span className="small-text">
              {result.passed
                ? 'Every stroke right, in the right order.'
                : `${result.mistakes} ${result.mistakes === 1 ? 'mistake' : 'mistakes'}. Write it again cleanly to pass.`}
            </span>
            <button className={`btn small ${result.passed ? 'quiet' : 'primary'}`} onClick={reset}>
              <Icon name="replay" size={15} /> {result.passed ? 'Write again' : 'Write it again'}
            </button>
          </div>
        )}
      </div>

      <div className="wc-progress" aria-hidden>
        {chars.length > 1 && <span className="jp wc-which">{chars.map((c, i) => <span key={i} className={i === ci ? 'on' : ''}>{c.char}</span>)}</span>}
        {cur.exp.map((_, i) => (
          <i key={i} className={i < si ? 'done' : i === si && !result ? 'now' : ''} />
        ))}
      </div>
      <p className={`wc-msg small-text ${message ? 'bad' : 'muted'}`} aria-live="polite">
        {result ? ' ' : message || (si < total ? `Stroke ${si + 1} of ${total}` : ' ')}
      </p>
      {!result && (
        <div className="row gap-s center">
          <button className="btn small quiet" onClick={askHint}>
            <Icon name="eye" size={15} /> Hint
          </button>
          <button className="btn small quiet" onClick={reset}>
            <Icon name="replay" size={15} /> Start over
          </button>
        </div>
      )}
    </div>
  )
}

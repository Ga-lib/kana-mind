import { useEffect, useRef, useState } from 'react'

export default function WritingPad({ char, size = 240 }: { char: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<[number, number] | null>(null)
  const [trace, setTrace] = useState(true)
  const [strokes, setStrokes] = useState(0)

  const clear = () => {
    const c = ref.current
    if (!c) return
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setStrokes(0)
  }

  useEffect(clear, [char])

  const pos = (e: React.PointerEvent): [number, number] => {
    const r = ref.current!.getBoundingClientRect()
    const scale = ref.current!.width / r.width
    return [(e.clientX - r.left) * scale, (e.clientY - r.top) * scale]
  }

  const down = (e: React.PointerEvent) => {
    e.preventDefault()
    ref.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const ctx = ref.current!.getContext('2d')!
    const p = pos(e)
    ctx.strokeStyle = getComputedStyle(ref.current!).getPropertyValue('--ink').trim() || '#222'
    ctx.lineWidth = size / 18
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(...last.current)
    ctx.lineTo(...p)
    ctx.stroke()
    last.current = p
  }
  const up = () => {
    if (drawing.current) setStrokes((s) => s + 1)
    drawing.current = false
    last.current = null
  }

  return (
    <div className="pad-wrap">
      <div className="pad" style={{ width: size, height: size }}>
        {trace && <div className="pad-ghost" style={{ fontSize: size * (char.length > 1 ? 0.45 : 0.78) }}>{char}</div>}
        <canvas
          ref={ref}
          width={size * 2}
          height={size * 2}
          style={{ width: size, height: size }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="row gap-s center">
        <button className="btn small" onClick={clear}>Clear</button>
        <button className="btn small ghost-btn" onClick={() => setTrace((t) => !t)}>
          {trace ? 'Hide guide' : 'Show guide'}
        </button>
        <span className="muted small-text">{strokes} drawn</span>
      </div>
    </div>
  )
}

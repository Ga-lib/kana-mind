// Stroke checking for handwriting practice. All coordinates are in the KanjiVG 109×109 grid.
// A drawn stroke is compared with the expected stroke by shape (mean distance after resampling),
// start and end points, direction and length; strokes are only accepted in the correct order.

export type Pt = [number, number]
export const N = 32

export function length(p: Pt[]): number {
  let l = 0
  for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])
  return l
}

/** Resample a polyline to n points evenly spaced along its length. */
export function resample(p: Pt[], n = N): Pt[] {
  if (p.length === 0) return []
  if (p.length === 1) return Array.from({ length: n }, () => p[0])
  const total = length(p)
  if (total === 0) return Array.from({ length: n }, () => p[0])
  const step = total / (n - 1)
  const out: Pt[] = [p[0]]
  let acc = 0
  let i = 1
  let prev = p[0]
  while (out.length < n - 1 && i < p.length) {
    const cur = p[i]
    const d = Math.hypot(cur[0] - prev[0], cur[1] - prev[1])
    if (acc + d >= step && d > 0) {
      const t = (step - acc) / d
      const q: Pt = [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]
      out.push(q)
      prev = q
      acc = 0
    } else {
      acc += d
      prev = cur
      i++
    }
  }
  while (out.length < n) out.push(p[p.length - 1])
  return out
}

function meanDist(a: Pt[], b: Pt[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1])
  return s / a.length
}
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])
const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length]

export interface Expected {
  pts: Pt[] // resampled
  len: number
}

export type Verdict =
  | { ok: true }
  | { ok: false; reason: 'order'; actual: number }
  | { ok: false; reason: 'direction' | 'shape' | 'position' | 'length' | 'tiny' }

export interface Tolerance {
  shape: number // max mean distance
  ends: number // max start/end distance
}
export const TRACE: Tolerance = { shape: 13, ends: 20 }
export const MEMORY: Tolerance = { shape: 18, ends: 26 }

const SHORT = 22

/** Light moving-average smoothing so finger/mouse jitter doesn't inflate a stroke's length. */
export function smooth(p: Pt[]): Pt[] {
  if (p.length < 3) return p
  return p.map((q, i) => {
    if (i === 0 || i === p.length - 1) return q
    const a = p[i - 1]
    const b = p[i + 1]
    return [(a[0] + q[0] + b[0]) / 3, (a[1] + q[1] + b[1]) / 3] as Pt
  })
}

function fits(user: Pt[], userLen: number, exp: Expected, tol: Tolerance): boolean {
  // Dots and short ticks: position, rough size and general direction matter; exact length doesn't.
  if (exp.len < SHORT) {
    if (dist(centroid(user), centroid(exp.pts)) >= tol.ends * 0.85) return false
    if (userLen > Math.max(36, exp.len * 3.4)) return false
    if (exp.len < 9 || userLen < 6) return true
    const ue: Pt = [user[N - 1][0] - user[0][0], user[N - 1][1] - user[0][1]]
    const ee: Pt = [exp.pts[N - 1][0] - exp.pts[0][0], exp.pts[N - 1][1] - exp.pts[0][1]]
    return ue[0] * ee[0] + ue[1] * ee[1] > 0
  }
  if (userLen < exp.len * 0.4 || userLen > exp.len * 2.1 + 12) return false
  return (
    meanDist(user, exp.pts) < tol.shape &&
    dist(user[0], exp.pts[0]) < tol.ends &&
    dist(user[N - 1], exp.pts[N - 1]) < tol.ends
  )
}

/** Check stroke `index` of `strokes` against what the learner drew. */
export function check(raw: Pt[], strokes: Expected[], index: number, tol: Tolerance): Verdict {
  const smoothed = smooth(smooth(raw))
  const userLen = length(smoothed)
  if (raw.length < 2 || userLen < 2.5) return { ok: false, reason: 'tiny' }
  const user = resample(smoothed)
  const exp = strokes[index]
  if (fits(user, userLen, exp, tol)) return { ok: true }

  // Is it a different, later stroke? Then it's an order mistake.
  for (let j = index + 1; j < strokes.length; j++) {
    if (fits(user, userLen, strokes[j], tol)) return { ok: false, reason: 'order', actual: j }
  }
  // Right path, drawn backwards?
  const reversed = [...user].reverse()
  if (fits(reversed, userLen, exp, tol)) return { ok: false, reason: 'direction' }
  // Diagnose the closest failure for a helpful message.
  if (exp.len >= SHORT && (userLen < exp.len * 0.4 || userLen > exp.len * 2.1 + 12)) return { ok: false, reason: 'length' }
  if (dist(centroid(user), centroid(exp.pts)) > tol.ends) return { ok: false, reason: 'position' }
  return { ok: false, reason: 'shape' }
}

/** Sample an SVG path's geometry using the browser's own path engine. */
let probe: SVGPathElement | null = null
export function samplePath(d: string): Expected {
  if (!probe) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.style.visibility = 'hidden'
    probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(probe)
    document.body.appendChild(svg)
  }
  probe.setAttribute('d', d)
  const len = probe.getTotalLength()
  const pts: Pt[] = []
  for (let i = 0; i < N; i++) {
    const p = probe.getPointAtLength((len * i) / (N - 1))
    pts.push([p.x, p.y])
  }
  return { pts, len }
}

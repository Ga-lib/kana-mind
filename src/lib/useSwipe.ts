import { useRef } from 'react'

// Horizontal swipe (touch) and two-finger trackpad swipe (wheel) navigation.
// Swipe left = next, swipe right = previous. Swipes that start on the writing pad, a text field,
// or anything marked .no-swipe are ignored, as are mostly-vertical gestures (scrolling).
const IGNORE = '.wc-box, textarea, input, select, .no-swipe'
const MIN_DISTANCE = 56
const MAX_DURATION = 900

export function useSwipe(onNext?: () => void, onPrev?: () => void) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const wheel = useRef({ dx: 0, last: 0, lock: 0 })

  return {
    onTouchStart(e: React.TouchEvent) {
      if (e.touches.length !== 1 || (e.target as Element).closest(IGNORE)) {
        start.current = null
        return
      }
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    },
    onTouchEnd(e: React.TouchEvent) {
      const s = start.current
      start.current = null
      if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - s.t > MAX_DURATION) return
      if (dx < 0) onNext?.()
      else onPrev?.()
    },
    onTouchCancel() {
      start.current = null
    },
    // Trackpads report a two-finger horizontal swipe as a burst of horizontal wheel events.
    onWheel(e: React.WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || (e.target as Element).closest(IGNORE)) return
      const now = Date.now()
      const w = wheel.current
      if (now < w.lock) return
      if (now - w.last > 250) w.dx = 0
      w.last = now
      w.dx += e.deltaX
      if (Math.abs(w.dx) < 90) return
      w.lock = now + 700 // one navigation per gesture
      const dir = w.dx
      w.dx = 0
      if (dir > 0) onNext?.()
      else onPrev?.()
    },
  }
}

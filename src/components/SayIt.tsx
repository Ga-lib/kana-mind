import { useState } from 'react'
import type { Item } from '../data'
import { canListen, listen } from '../lib/speech'
import { hiraToKata, kataToHira } from '../lib/util'

function targets(item: Item): string[] {
  const t = new Set<string>([item.char, kataToHira(item.char), hiraToKata(item.char)])
  item.examples?.forEach((e) => {
    t.add(e.w)
    t.add(e.r)
  })
  item.kun?.forEach((k) => t.add(k.replace(/[()]/g, '')))
  return [...t]
}

export default function SayIt({ item }: { item: Item }) {
  const [state, setState] = useState<'idle' | 'listening' | 'ok' | 'miss' | 'error'>('idle')
  const [heard, setHeard] = useState('')
  if (!canListen()) return null

  const go = async () => {
    setState('listening')
    setHeard('')
    try {
      const alts = await listen()
      const t = targets(item)
      const norm = alts.map((a) => kataToHira(a.replace(/[。、！？\s]/g, '')))
      const ok = norm.some((a) => t.some((x) => a.includes(kataToHira(x))))
      setHeard(alts[0] ?? '(nothing)')
      setState(ok ? 'ok' : 'miss')
    } catch {
      setState('error')
    }
  }

  const prompt = item.examples ? item.examples[0].r : item.char
  return (
    <div className="sayit">
      <button className="btn accent" onClick={go} disabled={state === 'listening'}>
        {state === 'listening' ? '🎙️ Listening…' : '🎤 Say it'}
      </button>
      <div className="small-text">
        {state === 'idle' && <>Say <b>{prompt}</b> into your microphone and check your pronunciation.</>}
        {state === 'listening' && <>Speak now…</>}
        {state === 'ok' && <span className="good">✓ Great! Heard “{heard}”.</span>}
        {state === 'miss' && <span className="bad">Heard “{heard}”. Listen again and retry. Single sounds are hard for the recognizer, so try saying it twice: “{prompt}{prompt}”.</span>}
        {state === 'error' && <span className="bad">Microphone not available. Check browser permissions.</span>}
      </div>
    </div>
  )
}

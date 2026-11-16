import { useState } from 'react'
import type { Item } from '../data'
import { canListen, listen } from '../lib/speech'
import { hiraToKata, kataToHira } from '../lib/util'
import Icon from './Icon'

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
      setHeard((alts[0] ?? '').slice(0, 60) || 'nothing')
      setState(ok ? 'ok' : 'miss')
    } catch {
      setState('error')
    }
  }

  const prompt = item.examples ? item.examples[0].r : item.char
  return (
    <div className={`sayit ${state}`}>
      <button className={`mic-btn ${state === 'listening' ? 'live' : ''}`} onClick={go} disabled={state === 'listening'} aria-label="Say it into the microphone">
        <Icon name="mic" size={24} />
      </button>
      <div className="small-text" aria-live="polite">
        {state === 'idle' && <span>Say <b className="jp">{prompt}</b> and check your pronunciation.</span>}
        {state === 'listening' && <span>Listening. Speak now.</span>}
        {state === 'ok' && <span className="good"><Icon name="check" size={16} /> Clear. Heard “{heard}”.</span>}
        {state === 'miss' && (
          <span className="bad">
            Heard “{heard}”. Listen once more and retry. Single sounds are hard to recognise, so try it twice: “{prompt}{prompt}”.
          </span>
        )}
        {state === 'error' && <span className="bad">The microphone is blocked. Allow it in your browser’s site settings.</span>}
        <span className="mic-note muted">Your browser’s speech service processes the recording.</span>
      </div>
    </div>
  )
}

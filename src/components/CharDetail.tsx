import { useEffect, useState } from 'react'
import type { Item } from '../data'
import { speak } from '../lib/speech'
import { setNote, useStore } from '../lib/store'
import StrokeOrder from './StrokeOrder'
import WritingPad from './WritingPad'
import SayIt from './SayIt'

export function MnemonicCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  return (
    <div className={`mnemo ${compact ? 'compact' : ''}`}>
      <div className="mnemo-pic" aria-hidden>
        <span className="mnemo-emoji">{item.emoji}</span>
        <span className={`mnemo-char ${item.script}`}>{item.char}</span>
      </div>
      <div className="mnemo-text">
        <div className="mnemo-head">
          <span className="romaji">{item.script === 'kanji' ? item.meaning : item.romaji}</span>
          <button className="icon-btn" title="Hear it" onClick={() => speak(item.speak)}>🔊</button>
        </div>
        <p>{item.mnemonic}</p>
      </div>
    </div>
  )
}

export default function CharDetail({ item, onClose, onPrev, onNext }: { item: Item; onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  const { notes, cards } = useStore()
  const [note, setLocal] = useState(notes[item.id] ?? '')
  const [tab, setTab] = useState<'learn' | 'write'>('learn')
  const card = cards[item.id]

  useEffect(() => {
    setLocal(notes[item.id] ?? '')
    speak(item.speak)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, onPrev, onNext])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <button className="icon-btn" onClick={onPrev} disabled={!onPrev} aria-label="Previous">‹</button>
          <div className="tabs">
            <button className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>Picture & sound</button>
            <button className={tab === 'write' ? 'on' : ''} onClick={() => setTab('write')}>Strokes & writing</button>
          </div>
          <button className="icon-btn" onClick={onNext} disabled={!onNext} aria-label="Next">›</button>
          <button className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {tab === 'learn' ? (
          <div className="detail">
            <div className="detail-hero">
              <div className={`big-char ${item.script}`}>{item.char}</div>
              <div>
                {item.script === 'kanji' ? (
                  <>
                    <div className="meaning">{item.meaning}</div>
                    <div className="readings">
                      {item.on && item.on.length > 0 && <div><b>On</b> {item.on.join('・')} <span className="muted">(Chinese-based, in compounds)</span></div>}
                      {item.kun && item.kun.length > 0 && <div><b>Kun</b> {item.kun.join('・')} <span className="muted">(native Japanese, alone)</span></div>}
                    </div>
                  </>
                ) : (
                  <div className="romaji-big">{item.romaji}</div>
                )}
                <div className="row gap-s">
                  <button className="btn" onClick={() => speak(item.speak)}>🔊 Listen</button>
                  <button className="btn ghost-btn" onClick={() => speak(item.speak, 0.5)}>🐢 Slow</button>
                </div>
                {card && (
                  <div className="muted small-text" style={{ marginTop: 8 }}>
                    Memory level {card.box}/6 · {card.right}✓ {card.wrong}✗
                  </div>
                )}
              </div>
            </div>

            <MnemonicCard item={item} />

            {item.tip && (
              <div className="tip">
                <b>👄 How to say it:</b> {item.tip}
              </div>
            )}

            {item.examples && (
              <div className="examples">
                <h4>Words you will meet</h4>
                {item.examples.map((ex) => (
                  <button key={ex.w} className="example" onClick={() => speak(ex.r)}>
                    <span className="ex-w">{ex.w}</span>
                    <span className="ex-r">{ex.r}</span>
                    <span className="ex-m">{ex.m}</span>
                    <span>🔊</span>
                  </button>
                ))}
              </div>
            )}

            <SayIt item={item} />

            <label className="note">
              <span>✏️ Your own memory story (the ones you invent stick best)</span>
              <textarea
                value={note}
                placeholder="e.g. It looks like my cat curled on the sofa…"
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => setNote(item.id, note)}
              />
            </label>
          </div>
        ) : (
          <div className="detail write-grid">
            <div>
              <h4>Watch the stroke order</h4>
              <StrokeOrder char={item.char} />
            </div>
            <div>
              <h4>Now trace it yourself</h4>
              <WritingPad char={item.char} />
            </div>
            <p className="muted small-text full">
              Rules of thumb: top before bottom, left before right, horizontal before vertical that crosses it. Writing by hand
              while saying the sound aloud uses three memory channels at once.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { Item } from '../data'
import { speak } from '../lib/speech'
import { setNote, useStore } from '../lib/store'
import Icon, { Seal } from './Icon'
import StrokeOrder from './StrokeOrder'
import WritingPad from './WritingPad'
import SayIt from './SayIt'
import Illustration, { hasIllustration } from './Illustration'

// The picture story: a drawn scene with the character's strokes inside it, stamped with its keyword seal.
// "Test yourself" fades the scene away so only the bare character is left to recall.
export function MnemonicCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const [bare, setBare] = useState(false)
  const drawn = hasIllustration(item.char)
  return (
    <div className={`mnemo ${compact ? 'compact' : ''}`}>
      <div className="mnemo-col">
        <div className={`mnemo-pic ${drawn ? 'drawn' : ''}`}>
          {drawn ? (
            <span className="illus-frame">
              <Illustration char={item.char} size={compact ? 96 : 168} bare={bare} />
              <span className="mnemo-badge" aria-hidden>{item.picture}</span>
            </span>
          ) : (
            <span className={`square-char ${item.script}`} aria-hidden>
              <span className="mnemo-picture">{item.picture}</span>
              <span className="mnemo-glyph">{item.char}</span>
            </span>
          )}
          <Seal text={item.keyword} size={compact ? 's' : 'm'} />
        </div>
        {drawn && !compact && (
          <button className="btn small quiet bare-toggle" aria-pressed={bare} onClick={() => setBare((b) => !b)}>
            <Icon name="eye" size={15} /> {bare ? 'Show the picture' : 'Test yourself'}
          </button>
        )}
      </div>
      <div className="mnemo-text">
        <div className="mnemo-head">
          <span className="romaji">{item.script === 'kanji' ? item.meaning : item.romaji}</span>
          <button className="icon-btn" aria-label={`Play ${item.char}`} onClick={() => speak(item.speak)}>
            <Icon name="speaker" />
          </button>
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
  const sheetRef = useRef<HTMLDivElement>(null)
  const card = cards[item.id]

  useEffect(() => {
    setLocal(notes[item.id] ?? '')
    speak(item.speak)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  // Focus the dialog, lock page scroll, restore focus on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    sheetRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [])

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
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${item.char} details`} tabIndex={-1} ref={sheetRef} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <button className="icon-btn" onClick={onPrev} disabled={!onPrev} aria-label="Previous character">
            <Icon name="left" />
          </button>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'learn'} className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>
              Story and sound
            </button>
            <button role="tab" aria-selected={tab === 'write'} className={tab === 'write' ? 'on' : ''} onClick={() => setTab('write')}>
              Write it
            </button>
          </div>
          <button className="icon-btn" onClick={onNext} disabled={!onNext} aria-label="Next character">
            <Icon name="right" />
          </button>
          <button className="icon-btn close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="tab-panel" key={item.id + tab}>
          {tab === 'learn' ? (
            <div className="detail">
              <div className="detail-hero">
                <div className={`big-char square ${item.script}`}>{item.char}</div>
                <div className="detail-side">
                  {item.script === 'kanji' ? (
                    <>
                      <div className="meaning">{item.meaning}</div>
                      <dl className="readings">
                        {item.on && item.on.length > 0 && (
                          <div><dt>On</dt><dd>{item.on.join('、')}</dd><span className="muted small-text">in compounds</span></div>
                        )}
                        {item.kun && item.kun.length > 0 && (
                          <div><dt>Kun</dt><dd>{item.kun.join('、')}</dd><span className="muted small-text">on its own</span></div>
                        )}
                      </dl>
                    </>
                  ) : (
                    <div className="romaji-big">{item.romaji}</div>
                  )}
                  <div className="row gap-s">
                    <button className="btn primary" onClick={() => speak(item.speak)}>
                      <Icon name="speaker" size={18} /> Listen
                    </button>
                    <button className="btn quiet" onClick={() => speak(item.speak, 0.5)}>
                      <Icon name="slow" size={18} /> Slowly
                    </button>
                  </div>
                  {card && (
                    <div className="memory-meter" aria-label={`Memory level ${card.box} of 6`}>
                      {[1, 2, 3, 4, 5, 6].map((b) => (
                        <i key={b} className={b <= card.box ? 'on' : ''} />
                      ))}
                      <span className="muted small-text">
                        {card.right} right, {card.wrong} missed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <MnemonicCard item={item} />

              {item.tip && (
                <div className="tip">
                  <Icon name="lips" size={20} />
                  <p><b>How to say it.</b> {item.tip}</p>
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
                      <Icon name="speaker" size={18} />
                    </button>
                  ))}
                </div>
              )}

              <SayIt item={item} />

              <label className="note">
                <span><Icon name="pencil" size={16} /> Your own memory story</span>
                <textarea
                  value={note}
                  maxLength={1000}
                  placeholder="Stories you invent yourself stick best. What does this shape remind you of?"
                  onChange={(e) => setLocal(e.target.value)}
                  onBlur={() => setNote(item.id, note)}
                />
              </label>
            </div>
          ) : (
            <div className="detail write-grid">
              <div className="write-col">
                <h4>Watch the strokes</h4>
                <StrokeOrder char={item.char} />
              </div>
              <div className="write-col">
                <h4>Trace it yourself</h4>
                <WritingPad char={item.char} />
              </div>
              <p className="muted small-text full">
                Top before bottom, left before right, horizontals before the verticals that cross them. Say the sound aloud as
                you write: sight, sound and movement give the memory three hooks instead of one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

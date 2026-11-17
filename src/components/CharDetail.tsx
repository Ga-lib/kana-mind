import { useEffect, useRef, useState } from 'react'
import type { Item } from '../data'
import { speak } from '../lib/speech'
import { record, setNote, useStore } from '../lib/store'
import Icon, { Seal } from './Icon'
import StrokeOrder from './StrokeOrder'
import WriteCheck from './WriteCheck'
import SayIt from './SayIt'
import Illustration, { hasIllustration } from './Illustration'
import Art from './Art'
import { useSwipe } from '../lib/useSwipe'

// The picture story. Three layers of memory hooks:
//  1. a drawn scene with the character's real strokes inside it (hand-made for kana and the core kanji),
//  2. a hand-drawn line illustration of the story's object (OpenMoji),
//  3. for kanji, the building-block parts that make up the meaning.
// "Test yourself" hides the pictures so only the bare character is left to recall.
export function MnemonicCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const [bare, setBare] = useState(false)
  const drawn = hasIllustration(item.char)
  const sketchBehind = !drawn && !!item.art
  return (
    <div className={`mnemo ${compact ? 'compact' : ''}`}>
      <div className="mnemo-col">
        <div className={`mnemo-pic ${drawn || sketchBehind ? 'drawn' : ''}`}>
          {drawn ? (
            <span className="illus-frame">
              <Illustration char={item.char} size={compact ? 96 : 168} bare={bare} />
              <span className="mnemo-badge" aria-hidden>
                {item.art ? <Art id={item.art} size={compact ? 18 : 24} /> : item.picture}
              </span>
            </span>
          ) : sketchBehind ? (
            <span className={`illus-frame sketch-frame ${bare ? 'bare' : ''}`} style={{ width: compact ? 104 : 176, height: compact ? 104 : 176 }}>
              <Art id={item.art} size={compact ? 96 : 168} className="sketch-behind" />
              <span className={`sketch-glyph ${item.script}`} aria-hidden>{item.char}</span>
            </span>
          ) : (
            <span className={`square-char ${item.script}`} aria-hidden>
              <span className="mnemo-picture">{item.picture}</span>
              <span className="mnemo-glyph">{item.char}</span>
            </span>
          )}
          <Seal text={item.keyword} size={compact ? 's' : 'm'} />
        </div>
        {(drawn || sketchBehind) && !compact && (
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
        {item.parts && item.parts.length > 1 && (
          <div className="parts" aria-label="Building blocks">
            {item.parts.map(([p, m], i) => (
              <span key={p + i} className="part">
                {i > 0 && <span className="plus">+</span>}
                <span className="part-char jp">{p}</span>
                <span className="part-m">{m}</span>
              </span>
            ))}
            <span className="plus">=</span>
            <span className="part"><span className="part-char jp">{item.char}</span><span className="part-m">{item.keyword}</span></span>
          </div>
        )}
      </div>
      {drawn && item.art && !compact && (
        <figure className="mnemo-sketch">
          <Art id={item.art} size={96} label={item.keyword} />
          <figcaption>{item.keyword}</figcaption>
        </figure>
      )}
    </div>
  )
}

export default function CharDetail({ item, onClose, onPrev, onNext }: { item: Item; onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  const { notes, cards } = useStore()
  const [note, setLocal] = useState(notes[item.id] ?? '')
  const [tab, setTab] = useState<'learn' | 'write'>('learn')
  const sheetRef = useRef<HTMLDivElement>(null)
  const [dir, setDir] = useState<'next' | 'prev' | ''>('')
  const card = cards[item.id]
  // One place for every way of moving between characters: arrows, keys, swipes.
  const goNext = onNext ? () => { setDir('next'); onNext() } : undefined
  const goPrev = onPrev ? () => { setDir('prev'); onPrev() } : undefined
  const swipe = useSwipe(goNext, goPrev)

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
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev?.()
      if (e.key === 'ArrowRight') goNext?.()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${item.char} details`} tabIndex={-1} ref={sheetRef} onClick={(e) => e.stopPropagation()} {...swipe}>
        <div className="sheet-top">
          <button className="icon-btn" onClick={goPrev} disabled={!goPrev} aria-label="Previous character">
            <Icon name="left" />
          </button>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'learn'} className={tab === 'learn' ? 'on' : ''} onClick={() => { setDir(''); setTab('learn') }}>
              Story and sound
            </button>
            <button role="tab" aria-selected={tab === 'write'} className={tab === 'write' ? 'on' : ''} onClick={() => { setDir(''); setTab('write') }}>
              Write it
            </button>
          </div>
          <button className="icon-btn" onClick={goNext} disabled={!goNext} aria-label="Next character">
            <Icon name="right" />
          </button>
          <button className="icon-btn close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <p className="swipe-hint" aria-hidden>Swipe left or right for the next or previous character</p>
        <div className={`tab-panel ${dir ? 'slide-' + dir : ''}`} key={item.id + tab}>
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
                <h4>Now write it</h4>
                <WriteCheck text={item.char} speakText={item.speak} onResult={(passed) => record(item.id, passed)} />
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

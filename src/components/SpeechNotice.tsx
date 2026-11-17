import { useEffect, useState } from 'react'
import { resetVoices, speak, type SpeechProblem } from '../lib/speech'
import Icon from './Icon'

/** Platform-specific steps to get a Japanese voice. */
export function voiceFix(): { title: string; steps: string[] } {
  const ua = navigator.userAgent
  const firefox = /firefox/i.test(ua)
  const edge = /edg\//i.test(ua)
  if (/windows/i.test(ua)) {
    return {
      title: 'Your computer has no working Japanese voice for this browser.',
      steps: [
        edge
          ? 'In Windows: Settings → Time & language → Speech → Manage voices → Add voices → Japanese. Then restart Edge.'
          : 'Quickest fix: open KanaMind in Microsoft Edge. It includes free Japanese voices.',
        `Or add one to Windows: Settings → Time & language → Speech → Manage voices → Add voices → Japanese, then restart ${firefox ? 'Firefox' : 'your browser'}.`,
        'Also check that this tab isn’t muted and your volume is up.',
      ],
    }
  }
  if (/mac os x|macintosh/i.test(ua)) {
    return {
      title: 'Your Mac has no Japanese voice turned on yet.',
      steps: [
        'System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Japanese → tick Kyoko (or Otoya).',
        'Then reload this page. Also check the tab isn’t muted.',
      ],
    }
  }
  if (/linux/i.test(ua) && !/android/i.test(ua)) {
    return {
      title: 'This browser has no Japanese voice on Linux.',
      steps: ['Use Chrome or Edge (they include online Japanese voices), or install a Japanese voice for speech-dispatcher.'],
    }
  }
  return {
    title: 'This device has no Japanese voice yet.',
    steps: [
      'Android: Settings → System → Languages & input → Text-to-speech → Speech Services by Google → Install voice data → Japanese.',
      'iPhone / iPad: Settings → Accessibility → Spoken Content → Voices → Japanese.',
    ],
  }
}

export default function SpeechNotice() {
  const [problem, setProblem] = useState<SpeechProblem | null>(null)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const on = (e: Event) => {
      setProblem((e as CustomEvent<SpeechProblem>).detail)
      setDismissed(false)
    }
    window.addEventListener('kanamind:speech-problem', on)
    return () => window.removeEventListener('kanamind:speech-problem', on)
  }, [])
  if (!problem || dismissed) return null

  const fix =
    problem === 'unsupported'
      ? { title: 'This browser can’t play speech.', steps: ['Open KanaMind in Chrome, Edge or Safari to hear the audio.'] }
      : voiceFix()
  return (
    <div className="speech-notice" role="alert">
      <Icon name="speaker" size={22} />
      <div>
        <b>No sound? {fix.title}</b>
        <ul>
          {fix.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="row gap-s">
          <button
            className="btn small primary"
            onClick={() => {
              setDismissed(true)
              resetVoices()
              speak('あいうえお')
            }}
          >
            Test the voice again
          </button>
          <a className="btn small quiet" href="#/sounds" onClick={() => setDismissed(true)}>Sound check</a>
        </div>
      </div>
      <button className="icon-btn" aria-label="Close" onClick={() => setDismissed(true)}>
        <Icon name="close" size={18} />
      </button>
    </div>
  )
}

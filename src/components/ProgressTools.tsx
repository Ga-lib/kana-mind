import { useRef, useState } from 'react'
import { exportProgress, importProgress, MAX_IMPORT_BYTES, resetProgress } from '../lib/store'
import { flush, useAccount } from '../lib/account'
import Icon from './Icon'

/** Export / import / erase. Works on the active profile: the signed-in account (synced) or this browser. */
export default function ProgressTools() {
  const { user } = useAccount()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const where = user ? 'your account' : 'this browser'

  const doExport = () => {
    const url = URL.createObjectURL(new Blob([exportProgress()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `kanamind-progress-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
    setMsg('Progress exported as a file.')
  }

  return (
    <section className="data-tools" aria-label="Your progress file">
      <button className="btn small quiet" onClick={doExport}>
        <Icon name="download" size={16} /> Export progress
      </button>
      <button className="btn small quiet" onClick={() => fileRef.current?.click()}>
        <Icon name="upload" size={16} /> Import progress
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          if (f.size > MAX_IMPORT_BYTES) return setMsg('That file is too large to be a KanaMind progress file.')
          if (!confirm(`Replace the progress in ${where} with this file?`)) return
          try {
            const n = importProgress(await f.text())
            if (user) await flush()
            setMsg(`Imported progress for ${n} characters into ${where}.`)
          } catch {
            setMsg('That file is not a KanaMind progress file.')
          }
        }}
      />
      <button
        className="btn small quiet"
        onClick={async () => {
          if (!confirm(`Erase all progress in ${where}? This can’t be undone. Export it first if you might want it back.`)) return
          resetProgress()
          if (user) await flush()
          setMsg(`Progress in ${where} erased.`)
        }}
      >
        <Icon name="reset" size={16} /> Erase progress
      </button>
      <p className="small-text muted full-row" role="status">
        {msg || (user ? 'Your progress is saved to your account automatically.' : 'Progress is saved in this browser. Sign in to keep it in your account.')}
      </p>
    </section>
  )
}

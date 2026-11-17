import { Component, type ReactNode } from 'react'

// Catches crashes so one broken screen never blanks the whole app.
// A failed chunk download (usually: a new version was deployed while this tab was open) gets a reload prompt.
export default class ErrorBoundary extends Component<{ children: ReactNode; full?: boolean }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('KanaMind crashed:', error)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const update = /dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically/i.test(error.message)
    return (
      <div className={`crash ${this.props.full ? 'full' : ''}`} role="alert">
        <h1>{update ? 'KanaMind was updated' : 'Something went wrong'}</h1>
        <p>
          {update
            ? 'A newer version is available. Reload to continue.'
            : 'This screen hit an unexpected problem. Your progress is safe. Reload the page, or go back to the home screen.'}
        </p>
        <div className="crash-actions">
          <button className="btn primary" onClick={() => location.reload()}>
            Reload
          </button>
          {!update && (
            <a
              className="btn"
              href="#/"
              onClick={() => {
                this.setState({ error: null })
              }}
            >
              Go to home
            </a>
          )}
        </div>
      </div>
    )
  }
}

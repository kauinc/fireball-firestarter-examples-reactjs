import { Component } from 'react'

/**
 * Catches render errors in the stream / overlay tree so a single
 * overlay crash does not blank the whole viewer.
 */
export class StreamErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[stream] overlay error', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      const message =
        this.state.error?.message || String(this.state.error) || 'Unknown error'
      return (
        <div className="stream-shell stream-shell--error">
          <div className="stream-shell__banner stream-shell__banner--warn" role="alert">
            Something went wrong. Reload the page to continue.
          </div>
          <button
            type="button"
            className="stream-shell__retry"
            aria-label="Reload page"
            title={message}
            onClick={() => window.location.reload()}
          />
        </div>
      )
    }
    return this.props.children
  }
}

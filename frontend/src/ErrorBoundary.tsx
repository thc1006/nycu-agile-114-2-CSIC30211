import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Last-resort boundary so a render-phase throw (or an error escaping a page's
 * imperative effect) degrades to a recoverable message instead of a blank
 * white screen. PageChrome already try/catches the Function()-based runtime and
 * inline scripts; this catches anything that slips past that.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CampusEats] render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '32rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>頁面發生錯誤</h1>
          <p style={{ marginBottom: '1rem' }}>載入這個畫面時發生問題，請重新整理再試一次。</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1px solid currentColor', background: '#000', color: '#fff', cursor: 'pointer' }}
          >
            重新整理
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

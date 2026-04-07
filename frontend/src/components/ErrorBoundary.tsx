import React from 'react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; errorMessage: string }

/**
 * Top-level React ErrorBoundary.
 * Catches unhandled render/lifecycle errors that would otherwise produce a white
 * screen on Android. On error, shows a recovery UI instead of crashing the app.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? 'Unknown error' }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[OorjakullApp] Uncaught render error:', error.message, info.componentStack)
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' })
    // Hard-reload clears all WebView state (stale MediaPipe WASM, etc.)
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#f1f5f9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '0',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🧘</div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: '#f1f5f9',
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            marginBottom: '0.5rem',
            maxWidth: '22rem',
            lineHeight: 1.6,
          }}
        >
          The app hit an unexpected error. Your session data is safe.
        </p>
        {this.state.errorMessage ? (
          <p
            style={{
              fontSize: '0.7rem',
              color: '#475569',
              marginBottom: '1.75rem',
              maxWidth: '22rem',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
            }}
          >
            {this.state.errorMessage}
          </p>
        ) : (
          <div style={{ marginBottom: '1.75rem' }} />
        )}
        <button
          onClick={this.handleReload}
          style={{
            padding: '0.7rem 2rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
            letterSpacing: '0.01em',
          }}
        >
          Tap to reload
        </button>
      </div>
    )
  }
}

import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { this.setState({ error, info }) }
  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <div className="card">
            <h3>Something went wrong</h3>
            <p className="muted">The app hit an error. Details below can help fix it quickly.</p>
            <pre>{String(this.state.error?.message || this.state.error)}</pre>
            {this.state.info?.componentStack && <pre className="muted" style={{ whiteSpace:'pre-wrap' }}>{this.state.info.componentStack}</pre>}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

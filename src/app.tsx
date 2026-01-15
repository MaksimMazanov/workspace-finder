import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { Dashboard } from './dashboard'
import { Provider } from './theme'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>Ошибка загрузки приложения</h1>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Provider>
          <Dashboard />
        </Provider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

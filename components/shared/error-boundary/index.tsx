'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children:  ReactNode
  fallback?: ReactNode
  onError?:  (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error:    Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    if (process.env.NODE_ENV === 'production') {
      console.error('[Contractory] Unhandled error:', error.message)
    }
  }

  handleReset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-status-error/20 bg-status-error/5 p-8 text-center">
          <AlertCircle size={28} className="text-status-error" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-text-primary">Something went wrong</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-background-secondary px-4 py-2 text-sm text-text-secondary hover:bg-background-tertiary transition-colors"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

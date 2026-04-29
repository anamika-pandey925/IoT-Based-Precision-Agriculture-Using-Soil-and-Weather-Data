import React from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12)',
            gap: 'var(--space-4)',
            textAlign: 'center',
          }}
          role="alert"
        >
          <FaTriangleExclamation
            style={{ fontSize: '3rem', color: 'var(--color-danger)' }}
            aria-hidden="true"
          />
          <h2 style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

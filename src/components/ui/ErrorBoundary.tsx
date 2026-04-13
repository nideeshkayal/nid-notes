'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('UI boundary caught an error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              borderRadius: 10,
              padding: 20,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>
              {this.props.fallbackTitle || 'Rendering error'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
              {this.props.fallbackMessage || 'This panel hit an unexpected error. Reloading the view should recover it.'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

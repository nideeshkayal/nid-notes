'use client';

import React from 'react';
import { useApp, THEME_LABELS } from '@/context/AppContext';

export default function StatusBar() {
  const { activeNotePath, theme } = useApp();

  return (
    <footer
      id="status-bar"
      style={{
        height: 24,
        background: 'var(--status-bar-bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          ⎇ {activeNotePath ? `notes/${activeNotePath}.md` : 'No file open'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>{THEME_LABELS[theme] || theme}</span>
        <span style={{ color: 'var(--success)' }}>● Ready</span>
      </div>
    </footer>
  );
}

'use client';

import React from 'react';
import { useApp, THEME_LABELS } from '@/context/AppContext';
import type { NoteMeta } from '@/components/reader/NoteReader';
import { format } from 'date-fns';

export default function StatusBar({ noteMeta }: { noteMeta: NoteMeta | null }) {
  const { activeNotePath, theme, isMobile } = useApp();

  // On mobile we hide the status bar entirely to maximize content area; the
  // footer's path/word-count info is already surfaced in the navbar / outline.
  if (isMobile) return null;

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          ⎇ {activeNotePath ? `notes/${activeNotePath}.md` : 'No file open'}
        </span>
        {noteMeta && (
          <>
            <span>{noteMeta.wordCount.toLocaleString()} words</span>
            <span>{noteMeta.readingTime} min read</span>
            <span>Updated {format(new Date(noteMeta.lastModified), 'MMM d, yyyy')}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <span>{THEME_LABELS[theme] || theme}</span>
        <span style={{ color: 'var(--success)' }}>● Ready</span>
      </div>
    </footer>
  );
}

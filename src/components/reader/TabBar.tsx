'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';

export default function TabBar() {
  const { openTabs, activeNotePath, openNote, closeTab } = useApp();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  if (openTabs.length === 0) return null;

  return (
    <div
      id="tab-bar"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        height: 35,
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      }}
    >
      {openTabs.map(tabPath => {
        const isActive = tabPath === activeNotePath;
        const filename = tabPath.split('/').pop() || tabPath;

        return (
          <div
            key={tabPath}
            onClick={() => openNote(tabPath)}
            onMouseEnter={e => {
              setHoveredTab(tabPath);
              if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              setHoveredTab(current => current === tabPath ? null : current);
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px',
              minWidth: 0,
              maxWidth: 180,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              background: isActive ? 'var(--bg-base)' : 'transparent',
              borderRight: '1px solid var(--border)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.1s ease',
              position: 'relative',
            }}
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {filename}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tabPath);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
                borderRadius: 3,
                display: 'flex',
                flexShrink: 0,
                opacity: isActive || hoveredTab === tabPath ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-active)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.key === '?') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.closest('.cm-editor')) {
          setOpen(prev => !prev);
        }
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + N', desc: 'Create / Edit Note' },
    { key: 'Cmd/Ctrl + K', desc: 'Search / Jump' },
    { key: 'Cmd/Ctrl + \\', desc: 'Toggle Sidebar' },
    { key: 'Cmd/Ctrl + B', desc: 'Toggle Split View' },
    { key: '?', desc: 'Keyboard Shortcuts' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setOpen(false)}
      className="animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 400,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-mono)',
        }}
        className="animate-slideUp"
      >
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-active)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <Command size={16} style={{ color: 'var(--text-accent)' }} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
        
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shortcuts.map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.desc}</span>
              <kbd style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 11,
                color: 'var(--text-primary)',
              }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

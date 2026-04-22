'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FilePlus, FolderOpen, X } from 'lucide-react';

export default function CreateModal() {
  const { createModalOpen, setCreateModalOpen, setIsEditing, setEditorMode, setPickForEditor, setSearchOpen } = useApp();

  // Keyboard shortcut support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        const target = e.target as HTMLElement | null;
        const inInput =
          target instanceof HTMLElement &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            !!target.closest('.cm-editor'));
        if (inInput) return;
        e.preventDefault();
        setCreateModalOpen(true);
      }
      if (e.key === 'Escape' && createModalOpen) {
        setCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createModalOpen, setCreateModalOpen]);

  if (!createModalOpen) return null;

  const handleNewNote = () => {
    setCreateModalOpen(false);
    setEditorMode('new');
    setIsEditing(true);
  };

  const handleOpenExisting = () => {
    setCreateModalOpen(false);
    setPickForEditor(true);
    // Open the search modal so the user can pick a file to load into the editor
    setSearchOpen(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
      onClick={() => setCreateModalOpen(false)}
      className="animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="animate-scaleIn"
      >
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            Create Note
          </h2>
          <button
            onClick={() => setCreateModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleNewNote}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: 8, borderRadius: 6 }}>
              <FilePlus size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                New Note
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                Start a fresh markdown file
              </div>
            </div>
          </button>

          <button
            onClick={handleOpenExisting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ background: 'rgba(152, 195, 121, 0.12)', color: 'var(--success)', padding: 8, borderRadius: 6 }}>
              <FolderOpen size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Open Existing
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                Search and view an existing note
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

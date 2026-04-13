'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { NoteNode } from '@/lib/getNotesTree';
import { Search, FileText, ArrowRight } from 'lucide-react';

export default function SearchModal() {
  const { searchOpen } = useApp();

  if (!searchOpen) return null;

  return <SearchModalContent />;
}

function SearchModalContent() {
  const {
    setSearchOpen,
    tree,
    openNote,
    pickForEditor,
    setPickForEditor,
    setIsEditing,
    setEditorMode,
    setEditorNotePath,
  } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = useMemo(() => {
    const items: NoteNode[] = [];
    function traverse(nodes: NoteNode[]) {
      for (const node of nodes) {
        if (node.type === 'file') items.push(node);
        if (node.children) traverse(node.children);
      }
    }
    traverse(tree);
    return items;
  }, [tree]);

  const filtered = query.trim()
    ? files.filter(file => {
      const q = query.toLowerCase();
      const name = String(file.frontmatter?.title || file.name).toLowerCase();
      const path = file.path.toLowerCase();
      const tags = (file.frontmatter?.tags || []).join(' ').toLowerCase();
      return name.includes(q) || path.includes(q) || tags.includes(q);
    })
    : files;

  const safeSelectedIndex = filtered.length === 0 ? 0 : Math.min(selectedIndex, filtered.length - 1);

  useEffect(() => {
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(false);
        setPickForEditor(false);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setPickForEditor(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setPickForEditor, setSearchOpen]);

  const handleSelectFile = (path: string) => {
    if (pickForEditor) {
      setEditorNotePath(path);
      setEditorMode('existing');
      setIsEditing(true);
      setPickForEditor(false);
    } else {
      openNote(path);
    }
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[safeSelectedIndex]) {
      handleSelectFile(filtered[safeSelectedIndex].path);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 100,
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => {
        setSearchOpen(false);
        setPickForEditor(false);
      }}
      className="animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
        className="animate-scaleIn"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={pickForEditor ? 'Select a note to edit...' : 'Search notes, Jump to file...'}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
            }}
          />
          <button
            onClick={() => {
              setSearchOpen(false);
              setPickForEditor(false);
            }}
            style={{
              background: 'var(--bg-hover)',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            ESC
          </button>
        </div>

        <div style={{
          maxHeight: 360,
          overflow: 'auto',
          overscrollBehavior: 'contain',
          padding: '4px 0',
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}>
              No notes found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <div style={{
                padding: '4px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}>
                Files
              </div>
              {filtered.map((file, index) => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 16px',
                    background: index === safeSelectedIndex ? 'var(--bg-active)' : 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <FileText size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {file.frontmatter?.title || file.name.replace(/\.md$/, '')}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {file.path}
                    </div>
                  </div>
                  {file.frontmatter?.tags && file.frontmatter.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {file.frontmatter.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag-pill" style={{ fontSize: 9, padding: '0 5px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {index === safeSelectedIndex && (
                    <ArrowRight size={12} style={{ color: 'var(--text-accent)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
        }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}

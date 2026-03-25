'use client';

import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Image as ImageIcon } from 'lucide-react';

export default function ImagePicker({ onSelect, onClose }: { onSelect: (url: string) => void, onClose: () => void }) {
  const [images, setImages] = useState<{name: string, path: string, url: string}[]>([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setImages(data.images || []))
      .catch(() => setImages([]));
  }, []);

  const filtered = search
    ? images.filter(img => img.name.toLowerCase().includes(search.toLowerCase()) || img.path.toLowerCase().includes(search.toLowerCase()))
    : images;

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
      onClick={onClose}
      className="animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
        className="animate-scaleIn"
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ImageIcon size={18} /> Select Image
          </h2>
          <button
            onClick={onClose}
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

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <SearchIcon size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
        </div>

        {/* Grid */}
        <div style={{
          padding: 16,
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 16,
        }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No public images found.
            </div>
          ) : (
            filtered.map(img => (
              <div
                key={img.path}
                onClick={() => onSelect(img.url)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-base)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--code-bg)',
                  padding: 8,
                }}>
                  <img src={img.url} alt={img.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{
                  padding: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  borderTop: '1px solid var(--border)',
                }}>
                  {img.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

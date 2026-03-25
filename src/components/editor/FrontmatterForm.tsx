'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FrontmatterFormProps {
  frontmatter: any;
  onChange: (fm: any) => void;
}

export default function FrontmatterForm({ frontmatter, onChange }: FrontmatterFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [tagInput, setTagInput] = useState(() => (frontmatter.tags || []).join(', '));

  useEffect(() => {
    setTagInput((frontmatter.tags || []).join(', '));
  }, [frontmatter.tags]);

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ fontWeight: 600 }}>---</span>
        <span style={{ color: 'var(--text-muted)' }}>Frontmatter Metadata</span>
      </button>

      {expanded && (
        <div style={{ padding: '8px 16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Simple Form Fields */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-primary)' }}>
            Title
            <input
              type="text"
              value={frontmatter.title || ''}
              onChange={e => onChange({ ...frontmatter, title: e.target.value })}
              style={{ padding: '6px 8px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 4, outline: 'none' }}
              placeholder="Auto-inferred from filename or H1 if empty"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-primary)' }}>
            Tags (comma separated)
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onBlur={() => onChange({ ...frontmatter, tags: tagInput.split(',').map((t: string) => t.trim()).filter(Boolean) })}
              style={{ padding: '6px 8px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 4, outline: 'none' }}
              placeholder="e.g. devops, docker, setup"
            />
          </label>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!frontmatter.draft}
                onChange={e => onChange({ ...frontmatter, draft: e.target.checked })}
              />
              Draft
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!frontmatter.pinned}
                onChange={e => onChange({ ...frontmatter, pinned: e.target.checked })}
              />
              Pinned
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

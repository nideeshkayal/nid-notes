'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { HeadingItem } from '@/components/reader/NoteReader';
import { Download, Copy } from 'lucide-react';
import { exportToPdf } from '@/lib/exportUtils';

export default function OutlinePanel({ headings }: { headings: HeadingItem[] }) {
  const { activeNotePath } = useApp();
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [downloadLabel, setDownloadLabel] = useState('.md');
  const [pdfLabel, setPdfLabel] = useState('.pdf');

  useEffect(() => {
    if (headings.length === 0) return;

    const container = document.getElementById('reader-container');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-16px 0px -80% 0px' }
    );

    const timer = setTimeout(() => {
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  const resetActionLabel = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    window.setTimeout(() => setter(value), 2000);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById('reader-container');
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.scrollTo({
        top: container.scrollTop + (elRect.top - containerRect.top) - 16,
        behavior: 'smooth',
      });
    }
  };

  const handleCopyMarkdown = async () => {
    if (!activeNotePath) return;
    try {
      const res = await fetch(`/api/notes?path=${encodeURIComponent(activeNotePath)}`);
      const data = await res.json();
      await navigator.clipboard.writeText(data.content);
      setCopyLabel('Copied!');
      resetActionLabel(setCopyLabel, 'Copy');
    } catch {}
  };

  const handleDownloadMd = async () => {
    if (!activeNotePath) return;
    try {
      const res = await fetch(`/api/notes?path=${encodeURIComponent(activeNotePath)}`);
      const data = await res.json();
      const name = activeNotePath.split('/').pop() || 'note';
      const blob = new Blob([data.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name.endsWith('.md') ? name : `${name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadLabel('Downloaded');
      resetActionLabel(setDownloadLabel, '.md');
    } catch {}
  };

  const handleDownloadPdf = async () => {
    if (!activeNotePath) return;
    setPdfLabel('Preparing PDF...');
    await exportToPdf('note');
    setPdfLabel('Print dialog opened');
    resetActionLabel(setPdfLabel, '.pdf');
  };

  return (
    <aside
      id="outline-panel"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}>
          On This Page
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {headings.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}>
            No headings found
          </div>
        ) : (
          headings.map((heading, i) => {
            const indent = (heading.level - 1) * 8;
            const isActive = heading.id === activeHeading;

            return (
              <button
                key={`${heading.id}-${i}`}
                onClick={() => scrollToHeading(heading.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  width: '100%',
                  padding: '4px 12px',
                  paddingLeft: 12 + indent,
                  background: 'none',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: heading.level === 1 ? 12 : 11,
                  fontWeight: heading.level <= 2 ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {heading.text}
                </span>
              </button>
            );
          })
        )}
      </div>

      {activeNotePath && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            notes/{activeNotePath}.md
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadMd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                transition: 'all 0.1s',
              }}
            >
              <Download size={10} /> {downloadLabel}
            </button>
            <button
              onClick={handleDownloadPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                transition: 'all 0.1s',
              }}
            >
              <Download size={10} /> {pdfLabel}
            </button>
            <button
              onClick={handleCopyMarkdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                transition: 'all 0.1s',
              }}
            >
              <Copy size={10} /> {copyLabel}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

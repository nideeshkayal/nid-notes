'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { HeadingItem } from '@/components/reader/NoteReader';
import { FileText, Clock, Calendar, Download, Copy, ChevronRight } from 'lucide-react';

export default function OutlinePanel({ headings }: { headings: HeadingItem[] }) {
  const { activeNotePath } = useApp();
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  // Scroll-spy via intersection observer
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

    // Delay to allow DOM to render
    const timer = setTimeout(() => {
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

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
    } catch {}
  };

  const handleDownloadPdf = async () => {
    if (!activeNotePath) return;
    const filename = activeNotePath.split('/').pop() || 'note';
    const element = document.getElementById('reader-container');
    if (!element) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { default: jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0d0d',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF', error);
    }
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
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
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

      {/* Headings List */}
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
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {heading.text}
              </button>
            );
          })
        )}
      </div>

      {/* File Metadata & Actions */}
      {activeNotePath && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            📄 notes/{activeNotePath}.md
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
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--text-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Download size={10} /> .md
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
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--text-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Download size={10} /> .pdf
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
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--text-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Copy size={10} /> Copy
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

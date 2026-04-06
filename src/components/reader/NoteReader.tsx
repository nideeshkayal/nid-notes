'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, User, FileText, BookOpen } from 'lucide-react';

export type NoteData = {
  content: string;
  html: string;
  lastModified: string;
  wordCount: number;
  frontmatter?: any;
};

export type HeadingItem = {
  level: number;
  text: string;
  id: string;
};

export default function NoteReader({ onHeadingsChange }: { onHeadingsChange?: (headings: HeadingItem[]) => void }) {
  const { activeNotePath } = useApp();
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeNotePath) {
      setNoteData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/notes?path=${encodeURIComponent(activeNotePath)}`)
      .then(res => res.json())
      .then(data => {
        setNoteData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeNotePath]);

  // Extract headings and initialize mermaid
  useEffect(() => {
    if (!noteData?.html || !onHeadingsChange || !contentRef.current) return;

    // Wait for DOM to render the HTML
    const timer = setTimeout(async () => {
      const article = contentRef.current?.querySelector('article');
      if (!article) return;
      
      // Mermaid initialization
      const mermaidEls = article.querySelectorAll('.mermaid');
      if (mermaidEls.length > 0) {
        try {
          const { default: mermaid } = await import('mermaid');
          mermaid.initialize({ startOnLoad: false, theme: 'dark' });
          await mermaid.run({ nodes: Array.from(mermaidEls) as HTMLElement[] });
        } catch (err) {
          console.error('Mermaid render error', err);
        }
      }

      const headingEls = article.querySelectorAll('h1, h2, h3, h4');
      const headings: HeadingItem[] = [];
      
      headingEls.forEach((el) => {
        const level = parseInt(el.tagName.charAt(1));
        const text = el.textContent || '';
        headings.push({ level, text, id: el.id });
      });
      
      onHeadingsChange(headings);
    }, 100);

    return () => clearTimeout(timer);
  }, [noteData, onHeadingsChange]);

  if (!activeNotePath) {
    return <WelcomeScreen />;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}>
        Loading note...
      </div>
    );
  }

  if (!noteData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}>
        Note not found
      </div>
    );
  }

  const frontmatter = noteData.frontmatter || {};
  const renderedHtml = noteData.html;
  const title = frontmatter.title || activeNotePath.split('/').pop() || '';
  const readingTime = Math.max(1, Math.round(noteData.wordCount / 200));

  return (
    <div
      id="reader-container"
      ref={contentRef}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '32px 48px',
      }}
      className="animate-fadeIn"
    >
      <div style={{ maxWidth: '72ch', margin: '0 auto' }}>
        {/* Note Header */}
        <header style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 12,
          }}>
            {title}
          </h1>

          {/* Metadata Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {frontmatter.tags.map((tag: string) => (
                  <span key={tag} className="tag-pill">#{tag}</span>
                ))}
              </div>
            )}
            {frontmatter.author && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> {frontmatter.author}
              </span>
            )}
            {frontmatter.created && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> {frontmatter.created instanceof Date ? frontmatter.created.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : String(frontmatter.created)}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={12} /> {readingTime} min read
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText size={12} /> {noteData.wordCount.toLocaleString()} words
            </span>
            {frontmatter.draft && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--warning)',
                background: 'rgba(229,160,80,0.15)',
                padding: '1px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                Draft
              </span>
            )}
          </div>

          <hr style={{
            marginTop: 16,
            border: 'none',
            height: 1,
            background: 'linear-gradient(90deg, var(--accent), transparent)',
            opacity: 0.3,
          }} />
        </header>

        {/* Rendered Markdown */}
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="animate-fadeIn"
    >
      <div style={{ textAlign: 'center', maxWidth: 520, padding: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 48,
          fontWeight: 600,
          color: 'var(--text-accent)',
          marginBottom: 8,
          letterSpacing: '-0.03em',
        }}>
          ▌nid notes
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          color: 'var(--text-secondary)',
          marginBottom: 32,
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          &ldquo;Your notes are just files. This is just a window into them.&rdquo;
        </p>
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          textAlign: 'left',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            {'// Drop .md files in the notes/ folder'}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>notes/</span>
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: 'var(--text-accent)' }}>devops/</span>
          </div>
          <div style={{ paddingLeft: 32 }}>
            git-and-github-notes.md
          </div>
          <div style={{ paddingLeft: 32 }}>
            docker-basics.md
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: 'var(--text-accent)' }}>programming/</span>
          </div>
          <div style={{ paddingLeft: 32 }}>
            closures.md
          </div>
          <div style={{ paddingLeft: 16 }}>
            quick-notes.md
          </div>
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 16,
        }}>
          Select a note from the sidebar to get started
        </p>
      </div>
    </div>
  );
}

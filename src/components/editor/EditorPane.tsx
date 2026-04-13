'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import { Download, Eye, Layout, Type, Image as ImageIcon, X, Copy } from 'lucide-react';
import matter from 'gray-matter';
import FrontmatterForm from './FrontmatterForm';
import ImagePicker from './ImagePicker';
import { exportToPdf } from '@/lib/exportUtils';

type FrontmatterValue = string | number | boolean | string[] | undefined;
type FrontmatterState = Record<string, FrontmatterValue>;

type DraftState = {
  content: string;
  htmlPreview: string;
  frontmatter: FrontmatterState;
  filename: string;
  folder: string;
};

function getFolderFromPath(notePath: string) {
  const folderParts = notePath.split('/');
  folderParts.pop();
  return folderParts.length ? `${folderParts.join('/')}/` : '';
}

function createInitialState(editorMode: 'new' | 'existing'): DraftState {
  if (typeof window === 'undefined' || editorMode !== 'new') {
    return { content: '', htmlPreview: '', frontmatter: {}, filename: '', folder: '' };
  }

  const savedDraft = localStorage.getItem('nid-notes-draft');
  if (!savedDraft) {
    return { content: '', htmlPreview: '', frontmatter: {}, filename: '', folder: '' };
  }

  try {
    const draft = JSON.parse(savedDraft) as Partial<DraftState>;
    return {
      content: draft.content || '',
      htmlPreview: '',
      frontmatter: draft.frontmatter || {},
      filename: draft.filename || '',
      folder: draft.folder || '',
    };
  } catch {
    return { content: '', htmlPreview: '', frontmatter: {}, filename: '', folder: '' };
  }
}

export default function EditorPane() {
  const { isEditing, editorMode, editorNotePath } = useApp();

  if (!isEditing) return null;

  return <EditorPaneSession key={`${editorMode}:${editorNotePath || 'new'}`} />;
}

function EditorPaneSession() {
  const { setIsEditing, editorMode, editorNotePath, theme } = useApp();
  const compileRequestRef = useRef(0);
  const [state, setState] = useState<DraftState>(() => createInitialState(editorMode));
  const [previewMode, setPreviewMode] = useState<'editor' | 'split' | 'preview'>('split');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy MD');
  const [downloadLabel, setDownloadLabel] = useState('.md');
  const [pdfLabel, setPdfLabel] = useState('.pdf');

  useEffect(() => {
    if (editorMode !== 'existing' || !editorNotePath) return;

    let cancelled = false;
    fetch(`/api/notes?path=${encodeURIComponent(editorNotePath)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data && typeof data.content === 'string') {
          setState({
            content: data.content,
            htmlPreview: '',
            frontmatter: (data.frontmatter || {}) as FrontmatterState,
            filename: editorNotePath.split('/').pop() || '',
            folder: getFolderFromPath(editorNotePath),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editorMode, editorNotePath]);

  useEffect(() => {
    if (!state.content) return;

    const timeout = setTimeout(() => {
      localStorage.setItem('nid-notes-draft', JSON.stringify({
        content: state.content,
        frontmatter: state.frontmatter,
        filename: state.filename,
        folder: state.folder,
        timestamp: new Date().toISOString(),
      }));
    }, 3000);

    return () => clearTimeout(timeout);
  }, [state.content, state.filename, state.folder, state.frontmatter]);

  useEffect(() => {
    if (previewMode === 'editor' || !state.content.trim()) return;

    const requestId = ++compileRequestRef.current;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: state.content, theme }),
        });
        const data = await res.json();
        if (requestId === compileRequestRef.current) {
          setState(prev => ({ ...prev, htmlPreview: data.html || '' }));
        }
      } catch (err) {
        if (requestId === compileRequestRef.current) {
          setState(prev => ({
            ...prev,
            htmlPreview: `<p style="color:red">Preview Compilation Error: ${String(err)}</p>`,
          }));
        }
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [previewMode, state.content, theme]);

  const resetActionLabel = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    window.setTimeout(() => setter(value), 2000);
  };

  const getFullMarkdown = () => {
    if (Object.keys(state.frontmatter).length === 0) {
      return state.content;
    }
    return matter.stringify(state.content, state.frontmatter);
  };

  const handleDownloadMd = () => {
    const fullContent = getFullMarkdown();
    const name = state.filename || 'untitled-note';
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadLabel('Downloaded');
    resetActionLabel(setDownloadLabel, '.md');
  };

  const handleDownloadPdf = async () => {
    if (previewMode === 'editor') {
      alert('Switch to Split or Preview mode to export a PDF.');
      return;
    }

    setPdfLabel('Preparing PDF...');
    await exportToPdf('editor');
    setPdfLabel('Print dialog opened');
    resetActionLabel(setPdfLabel, '.pdf');
  };

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(state.content);
    setCopyLabel('Copied!');
    resetActionLabel(setCopyLabel, 'Copy MD');
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const wordCount = state.content.split(/\s+/).filter(Boolean).length;
  const renderedPreview = state.content.trim() ? state.htmlPreview : '';

  return (
    <div
      id="editor-pane-shell"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-base)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        id="editor-toolbar"
        style={{
          height: 48,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
        }}
      >
        <div style={{ color: 'var(--text-accent)', fontWeight: 600, marginRight: 8 }}>
          ▌Create Note
        </div>

        <input
          type="text"
          value={state.filename}
          onChange={e => setState(prev => ({ ...prev, filename: e.target.value }))}
          placeholder="filename"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 8px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            width: 160,
            outline: 'none',
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>.md</span>

        <span style={{ color: 'var(--text-muted)', fontSize: 11, margin: '0 4px' }}>in</span>

        <input
          type="text"
          value={state.folder}
          onChange={e => setState(prev => ({ ...prev, folder: e.target.value }))}
          placeholder="notes/ (root)"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 8px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            width: 140,
            outline: 'none',
          }}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setImagePickerOpen(true)}
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            padding: '4px 10px',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}
        >
          <ImageIcon size={12} /> Image
        </button>

        <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: 6, padding: 2 }}>
          <button
            onClick={() => setPreviewMode('editor')}
            style={{
              background: previewMode === 'editor' ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 4,
              color: previewMode === 'editor' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <Type size={12} /> Editor
          </button>
          <button
            onClick={() => setPreviewMode('split')}
            style={{
              background: previewMode === 'split' ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 4,
              color: previewMode === 'split' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <Layout size={12} /> Split
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            style={{
              background: previewMode === 'preview' ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 4,
              color: previewMode === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <Eye size={12} /> Preview
          </button>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            color: 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(previewMode === 'editor' || previewMode === 'split') && (
          <div
            style={{
              flex: previewMode === 'split' ? '0 0 50%' : '1 1 auto',
              width: previewMode === 'split' ? '50%' : 'auto',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRight: previewMode === 'split' ? '1px solid var(--border)' : 'none',
              overflow: 'hidden',
            }}
          >
            <FrontmatterForm
              frontmatter={state.frontmatter}
              onChange={(frontmatter) => setState(prev => ({ ...prev, frontmatter }))}
            />
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--code-bg)' }}>
              <CodeMirror
                value={state.content}
                height="100%"
                extensions={[
                  markdown({ base: markdownLanguage, codeLanguages: languages }),
                  EditorView.lineWrapping,
                ]}
                onChange={(content) => setState(prev => ({ ...prev, content }))}
                theme="dark"
                style={{ fontSize: 14, fontFamily: 'var(--font-mono)', height: '100%' }}
              />
            </div>
          </div>
        )}

        {(previewMode === 'preview' || previewMode === 'split') && (
          <div
            id="editor-preview-shell"
            style={{
              flex: previewMode === 'split' ? '0 0 50%' : '1 1 auto',
              width: previewMode === 'split' ? '50%' : 'auto',
              minWidth: 0,
              padding: 32,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: 'var(--bg-base)',
            }}
          >
            <div
              id="editor-preview-content"
              className="prose"
              style={{
                maxWidth: previewMode === 'split' ? '100%' : '72ch',
                margin: '0 auto',
                color: 'var(--text-primary)',
                overflowWrap: 'anywhere',
              }}
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
          </div>
        )}
      </div>

      <div
        id="editor-action-bar"
        style={{
          height: 40,
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          {wordCount} words · {Math.max(1, Math.round(wordCount / 200))} min read
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleDownloadMd}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Download size={11} /> {downloadLabel}
        </button>
        <button
          onClick={handleDownloadPdf}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Download size={11} /> {pdfLabel}
        </button>
        <button
          onClick={handleCopyMarkdown}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Copy size={11} /> {copyLabel}
        </button>
      </div>

      {imagePickerOpen && (
        <ImagePicker
          onClose={() => setImagePickerOpen(false)}
          onSelect={(url) => {
            setState(prev => ({ ...prev, content: `${prev.content}\n![Image](${url})\n` }));
            setImagePickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

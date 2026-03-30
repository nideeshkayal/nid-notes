'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Download, Eye, Layout, Type, Image as ImageIcon, X, Copy } from 'lucide-react';
import FrontmatterForm from './FrontmatterForm';
import ImagePicker from './ImagePicker';

export default function EditorPane() {
  const { isEditing, setIsEditing, editorMode, editorNotePath } = useApp();
  
  const [content, setContent] = useState('');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [frontmatter, setFrontmatter] = useState<any>({});
  const [previewMode, setPreviewMode] = useState<'editor' | 'split' | 'preview'>('split');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [filename, setFilename] = useState('');
  const [folder, setFolder] = useState('');

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!isEditing) return;
    
    if (editorMode === 'new') {
      // Check for existing draft
      const savedDraft = localStorage.getItem('nid-notes-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setContent(draft.content || '');
          setFrontmatter(draft.frontmatter || {});
          setFilename(draft.filename || '');
          setFolder(draft.folder || '');
        } catch {
          setContent('');
          setFrontmatter({});
        }
      } else {
        setContent('');
        setFrontmatter({});
        setFilename('');
        setFolder('');
      }
    } else if (editorMode === 'existing') {
      if (!editorNotePath) return;
      fetch(`/api/notes?path=${encodeURIComponent(editorNotePath)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.content) {
            setContent(data.content || '');
            setFrontmatter(data.frontmatter || {});
            setFilename(editorNotePath.split('/').pop() || '');
            const folderParts = editorNotePath.split('/');
            folderParts.pop();
            setFolder(folderParts.length ? folderParts.join('/') + '/' : '');
          }
        });
    }
  }, [isEditing, editorMode]);

  // Autosave draft to localStorage every 3 seconds
  useEffect(() => {
    if (!isEditing || !content) return;
    
    const timeout = setTimeout(() => {
      localStorage.setItem('nid-notes-draft', JSON.stringify({
        content,
        frontmatter,
        filename,
        folder,
        timestamp: new Date().toISOString(),
      }));
    }, 3000);

    return () => clearTimeout(timeout);
  }, [content, frontmatter, filename, folder, isEditing]);

  // Debounced Compilation Effect for preview
  useEffect(() => {
    if (previewMode === 'editor') return;
    
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        const data = await res.json();
        setHtmlPreview(data.html || '');
      } catch (err) {
        setHtmlPreview(`<p style="color:red">Preview Compilation Error: ${String(err)}</p>`);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [content, previewMode]);

  const handleDownloadMd = () => {
    const matter = frontmatter && Object.keys(frontmatter).length > 0
      ? `---\n${Object.entries(frontmatter).map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: [${v.join(', ')}]`;
          return `${k}: ${v}`;
        }).join('\n')}\n---\n\n`
      : '';
    const fullContent = matter + content;
    const name = filename || 'untitled-note';
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    // Use html2canvas + jsPDF for PDF export
    const previewEl = document.getElementById('editor-preview-content');
    if (!previewEl) {
      alert('Switch to Split or Preview mode to download as PDF');
      return;
    }
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { default: jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(previewEl, {
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
      
      // Handle multi-page
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${filename || 'untitled-note'}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
  };

  const handleEditorChange = (value: string) => {
    setContent(value);
  };

  const handleClose = () => {
    setIsEditing(false);
    setContent('');
    setFrontmatter({});
    setHtmlPreview('');
    setFilename('');
    setFolder('');
  };

  if (!isEditing) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-base)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Editor Header / Toolbar */}
      <div style={{
        height: 48,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}>
        <div style={{ color: 'var(--text-accent)', fontWeight: 600, marginRight: 8 }}>
          ▌Create Note
        </div>
        
        {/* Filename input */}
        <input
          type="text"
          value={filename}
          onChange={e => setFilename(e.target.value)}
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
        
        {/* Folder input */}
        <input
          type="text"
          value={folder}
          onChange={e => setFolder(e.target.value)}
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
        
        {/* Image button */}
        <button
          onClick={() => setImagePickerOpen(true)}
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            padding: '4px 10px',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}
        >
          <ImageIcon size={12} /> Image
        </button>

        {/* View toggle */}
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
              display: 'flex', alignItems: 'center', gap: 4,
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
              display: 'flex', alignItems: 'center', gap: 4,
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
              display: 'flex', alignItems: 'center', gap: 4,
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

      {/* Editor Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(previewMode === 'editor' || previewMode === 'split') && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: previewMode === 'split' ? '1px solid var(--border)' : 'none',
          }}>
            <FrontmatterForm frontmatter={frontmatter} onChange={setFrontmatter} />
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--code-bg)' }}>
              <CodeMirror
                value={content}
                height="100%"
                extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                onChange={handleEditorChange}
                theme="dark"
                style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>
        )}

        {(previewMode === 'preview' || previewMode === 'split') && (
          <div style={{ flex: 1, padding: 32, overflowY: 'auto', background: 'var(--bg-base)' }}>
            <div
              id="editor-preview-content"
              className="prose"
              style={{ maxWidth: '72ch', margin: '0 auto', color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        height: 40,
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {content.split(/\s+/).filter(Boolean).length} words · {Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200))} min read
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
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Download size={11} /> .md
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
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Download size={11} /> .pdf
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
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Copy size={11} /> Copy MD
        </button>
      </div>

      {imagePickerOpen && (
        <ImagePicker 
          onClose={() => setImagePickerOpen(false)} 
          onSelect={(url) => {
            setContent(prev => prev + `\n![Image](${url})\n`);
            setImagePickerOpen(false);
          }} 
        />
      )}
    </div>
  );
}

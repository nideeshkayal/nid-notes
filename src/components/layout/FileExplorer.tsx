'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { NoteNode } from '@/lib/getNotesTree';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Star,
  RefreshCw,
} from 'lucide-react';

function TreeNode({ node, depth = 0 }: { node: NoteNode; depth?: number }) {
  const { activeNotePath, openNote, isMobile, setMobileSidebarOpen } = useApp();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`folder-${node.path}`);
      return saved !== null ? saved === 'true' : depth < 2;
    }
    return depth < 2;
  });

  const handleOpenFile = (path: string) => {
    openNote(path);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(`folder-${node.path}`, String(next));
  };

  const isActive = node.type === 'file' && activeNotePath === node.path;
  const isPinned = node.type === 'file' && node.frontmatter?.pinned;
  const isDraft = node.type === 'file' && node.frontmatter?.draft;
  const displayName = node.type === 'file'
    ? (node.frontmatter?.title || node.name.replace(/\.md$/, ''))
    : node.name;

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={toggleOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            width: '100%',
            padding: isMobile ? '8px 8px' : '4px 8px',
            paddingLeft: 8 + depth * 12,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            textAlign: 'left',
            borderRadius: 4,
            transition: 'background 0.1s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {isOpen ? <FolderOpen size={14} style={{ color: 'var(--text-accent)' }} /> : <Folder size={14} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
        </button>
        {isOpen && node.children && (
          <div>
            {node.children.map(child => (
              <TreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => handleOpenFile(node.path)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        padding: isMobile ? '8px 8px' : '4px 8px',
        paddingLeft: 8 + depth * 12,
        background: isActive ? 'var(--bg-active)' : 'none',
        border: 'none',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        textAlign: 'left',
        borderRadius: '0 4px 4px 0',
        transition: 'all 0.1s ease',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'none';
      }}
    >
      <FileText size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {displayName}
      </span>
      {isPinned && <Star size={10} style={{ color: 'var(--warning)', flexShrink: 0 }} fill="var(--warning)" />}
      {isDraft && (
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--warning)',
          background: 'rgba(229,160,80,0.15)',
          padding: '0 4px',
          borderRadius: 3,
          flexShrink: 0,
        }}>
          DRAFT
        </span>
      )}
    </button>
  );
}

export default function FileExplorer() {
  const { tree, setTree } = useApp();
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTree() {
      setLoading(true);
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        if (!cancelled) {
          setTree(data);
        }
      } catch (err) {
        console.error('Failed to load notes tree:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTree();
    return () => {
      cancelled = true;
    };
  }, [setTree]);

  const refreshTree = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to load notes tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    function collectTags(nodes: NoteNode[]) {
      for (const node of nodes) {
        if (node.type === 'file' && node.frontmatter?.tags) {
          node.frontmatter.tags.forEach(t => tags.add(t));
        }
        if (node.children) collectTags(node.children);
      }
    }
    collectTags(tree);
    return Array.from(tags).sort();
  }, [tree]);

  // Filter tree by tag
  function filterByTag(nodes: NoteNode[]): NoteNode[] {
    if (!tagFilter) return nodes;
    return nodes.reduce<NoteNode[]>((acc, node) => {
      if (node.type === 'file') {
        if (node.frontmatter?.tags?.includes(tagFilter)) {
          acc.push(node);
        }
      } else if (node.children) {
        const filteredChildren = filterByTag(node.children);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  }

  // Count notes/folders
  function countItems(nodes: NoteNode[]): { files: number; folders: number } {
    let files = 0, folders = 0;
    for (const n of nodes) {
      if (n.type === 'file') files++;
      else {
        folders++;
        if (n.children) {
          const c = countItems(n.children);
          files += c.files;
          folders += c.folders;
        }
      }
    }
    return { files, folders };
  }

  const filteredTree = filterByTag(tree);
  const pinnedNotes = getPinnedNotes(filteredTree);
  const { files, folders } = countItems(tree);

  return (
    <aside
      id="file-explorer"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          Explorer
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={refreshTree}
            title="Refresh"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 3,
              borderRadius: 3,
              display: 'flex',
              transition: 'color 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {loading ? (
          <div style={{
            padding: 16,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <div style={{
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Star size={10} fill="var(--warning)" />
                  Starred
                </div>
                {pinnedNotes.map(node => (
                  <TreeNode key={`pinned-${node.path}`} node={node} depth={0} />
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />
              </div>
            )}

            {/* Main Tree */}
            {filteredTree.length > 0 ? (
              filteredTree.map(node => (
                <TreeNode key={node.path} node={node} depth={0} />
              ))
            ) : (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
              }}>
                No notes found
              </div>
            )}
          </>
        )}
      </div>

      {/* Tags Section */}
      {allTags.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '8px 12px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}>
            Tags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className="tag-pill"
                style={{
                  cursor: 'pointer',
                  border: tagFilter === tag ? '1px solid var(--accent)' : '1px solid transparent',
                  background: tagFilter === tag ? 'var(--accent-dim)' : 'var(--bg-surface)',
                  color: tagFilter === tag ? 'var(--text-accent)' : 'var(--text-secondary)',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              style={{
                marginTop: 6,
                background: 'none',
                border: 'none',
                color: 'var(--text-accent)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
              }}
            >
              ✕ Clear filter
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
      }}>
        {files} notes across {folders} folders
      </div>
    </aside>
  );
}

function getPinnedNotes(nodes: NoteNode[]): NoteNode[] {
  const pinned: NoteNode[] = [];
  function traverse(items: NoteNode[]) {
    for (const node of items) {
      if (node.type === 'file' && node.frontmatter?.pinned) pinned.push(node);
      if (node.children) traverse(node.children);
    }
  }
  traverse(nodes);
  return pinned;
}

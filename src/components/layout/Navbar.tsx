'use client';

import React from 'react';
import { useApp, THEMES, THEME_LABELS } from '@/context/AppContext';
import {
  Search,
  Plus,
  Palette,
  PanelLeft,
  PanelRight,
  ChevronRight,
  Menu,
  ListOrdered,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeNotePath,
    toggleSidebar,
    toggleOutline,
    toggleSearch,
    theme,
    setTheme,
    setCreateModalOpen,
    isMobile,
    toggleMobileSidebar,
    toggleMobileOutline,
  } = useApp();

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  // Build breadcrumb from active note path
  const breadcrumbs = activeNotePath ? activeNotePath.split('/') : [];
  const lastSegment = breadcrumbs[breadcrumbs.length - 1];

  return (
    <nav
      id="navbar"
      style={{
        height: 48,
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Left: Sidebar toggle (desktop) / Hamburger (mobile) + Logo + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
        {isMobile ? (
          <button
            onClick={toggleMobileSidebar}
            aria-label="Open file explorer"
            title="Open file explorer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 8,
              borderRadius: 4,
            }}
          >
            <Menu size={20} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            title="Toggle sidebar (Ctrl+\\)"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 4,
            }}
          >
            <PanelLeft size={18} />
          </button>
        )}

        <span
          style={{
            fontWeight: 700,
            color: 'var(--text-accent)',
            fontSize: 14,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            letterSpacing: '-0.02em',
          }}
        >
          ▌nid notes
        </span>

        {/* Desktop breadcrumb */}
        {!isMobile && breadcrumbs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-muted)', minWidth: 0 }}>
            {breadcrumbs.map((segment, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    color: i === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 12,
                  }}
                >
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Mobile: just the leaf filename, truncated */}
        {isMobile && lastSegment && (
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            · {lastSegment}
          </span>
        )}
      </div>

      {/* Center: Search Bar (desktop only) */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px', minWidth: 0 }}>
          <button
            id="search-trigger"
            onClick={toggleSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              width: '100%',
              maxWidth: 400,
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Search size={14} />
            <span>Search files and contents...</span>
            <span style={{
              marginLeft: 'auto',
              padding: '1px 6px',
              background: 'var(--bg-hover)',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
            }}>
              ⌘K
            </span>
          </button>
        </div>
      )}

      {isMobile && <div style={{ flex: 1 }} />}

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {/* Mobile: Search icon button */}
        {isMobile && (
          <button
            onClick={toggleSearch}
            aria-label="Search"
            title="Search"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={18} />
          </button>
        )}

        {/* Theme toggle - hide on very narrow screens */}
        {!isMobile && (
          <button
            onClick={cycleTheme}
            title={`Theme: ${THEME_LABELS[theme]}`}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.1s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Palette size={16} />
          </button>
        )}

        {/* Outline toggle: desktop = panel toggle; mobile = drawer */}
        {isMobile ? (
          <button
            onClick={toggleMobileOutline}
            aria-label="Open outline"
            title="Outline"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ListOrdered size={18} />
          </button>
        ) : (
          <button
            onClick={toggleOutline}
            title="Toggle outline panel (Ctrl+B)"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.1s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <PanelRight size={16} />
          </button>
        )}

        <button
          id="create-note-btn"
          onClick={() => setCreateModalOpen(true)}
          aria-label="Create note"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: isMobile ? 8 : '5px 12px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: isMobile ? 8 : 6,
            color: 'var(--bg-base)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            transition: 'opacity 0.15s ease',
            marginLeft: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={isMobile ? 18 : 14} />
          {!isMobile && 'Create'}
        </button>
      </div>
    </nav>
  );
}

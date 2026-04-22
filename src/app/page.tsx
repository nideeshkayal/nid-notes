'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import FileExplorer from '@/components/layout/FileExplorer';
import OutlinePanel from '@/components/layout/OutlinePanel';
import StatusBar from '@/components/layout/StatusBar';
import TabBar from '@/components/reader/TabBar';
import NoteReader, { HeadingItem, NoteMeta } from '@/components/reader/NoteReader';
import SearchModal from '@/components/search/SearchModal';
import CreateModal from '@/components/editor/CreateModal';
import EditorPane from '@/components/editor/EditorPane';
import ShortcutsModal from '@/components/ui/ShortcutsModal';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (target.closest('.cm-editor')) return true;
  return false;
}

export default function Home() {
  const {
    sidebarOpen,
    outlineOpen,
    focusMode,
    isEditing,
    setSearchOpen,
    toggleSidebar,
    toggleOutline,
    searchOpen,
    createModalOpen,
    isMobile,
    mobileSidebarOpen,
    mobileOutlineOpen,
    setMobileSidebarOpen,
    setMobileOutlineOpen,
  } = useApp();

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [noteMeta, setNoteMeta] = useState<NoteMeta | null>(null);
  const sidebarWidth = 260;
  const outlineWidth = 220;

  // Desktop visibility flags - on mobile we always render the center pane and
  // present sidebar/outline as drawers controlled by mobileSidebarOpen / mobileOutlineOpen.
  const showSidebarDesktop = sidebarOpen && !focusMode && !isMobile;
  const showOutlineDesktop = outlineOpen && !focusMode && !isMobile;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      // Cmd/Ctrl+K — toggle search (always)
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }

      // The remaining shortcuts ignore typing contexts so users can keep typing freely.
      if (isTypingTarget(e.target) || createModalOpen || isEditing) return;

      if (e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleOutline();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen, toggleSidebar, toggleOutline, searchOpen, createModalOpen, isEditing]);

  // Lock body scroll when a mobile drawer is open
  useEffect(() => {
    if (!isMobile) return;
    const anyDrawerOpen = mobileSidebarOpen || mobileOutlineOpen;
    if (!anyDrawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, mobileSidebarOpen, mobileOutlineOpen]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      maxHeight: '100dvh',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Navbar */}
      {!focusMode && <Navbar />}

      {/* Main 3-Panel Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left Panel - File Explorer (desktop) */}
        {showSidebarDesktop && (
          <div style={{
            width: sidebarWidth,
            minWidth: 180,
            maxWidth: 400,
            flexShrink: 0,
            transition: 'width 0.2s ease-out',
          }}>
            <FileExplorer />
          </div>
        )}

        {/* Center Panel - Reader */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {!focusMode && <TabBar />}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <ErrorBoundary fallbackTitle="Reader failed" fallbackMessage="The note reader hit an error while rendering this note.">
              <NoteReader onHeadingsChange={setHeadings} onMetaChange={setNoteMeta} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Panel - Outline (desktop) */}
        {showOutlineDesktop && (
          <div style={{
            width: outlineWidth,
            minWidth: 160,
            maxWidth: 350,
            flexShrink: 0,
            transition: 'width 0.2s ease-out',
          }}>
            <OutlinePanel headings={headings} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!focusMode && <StatusBar noteMeta={noteMeta} />}

      {/* Mobile drawers */}
      {isMobile && mobileSidebarOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="mobile-drawer mobile-drawer-left">
            <FileExplorer />
          </aside>
        </>
      )}
      {isMobile && mobileOutlineOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setMobileOutlineOpen(false)} />
          <aside className="mobile-drawer mobile-drawer-right">
            <OutlinePanel headings={headings} />
          </aside>
        </>
      )}

      {/* Editor Overlay */}
      {isEditing && (
        <ErrorBoundary fallbackTitle="Editor failed" fallbackMessage="The editor hit an unexpected error while loading.">
          <EditorPane />
        </ErrorBoundary>
      )}

      {/* Search Modal */}
      <SearchModal />
      <CreateModal />
      <ShortcutsModal />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import FileExplorer from '@/components/layout/FileExplorer';
import OutlinePanel from '@/components/layout/OutlinePanel';
import StatusBar from '@/components/layout/StatusBar';
import TabBar from '@/components/reader/TabBar';
import NoteReader from '@/components/reader/NoteReader';
import SearchModal from '@/components/search/SearchModal';
import CreateModal from '@/components/editor/CreateModal';
import EditorPane from '@/components/editor/EditorPane';
import ShortcutsModal from '@/components/ui/ShortcutsModal';
import { HeadingItem } from '@/components/reader/NoteReader';

export default function Home() {
  const { sidebarOpen, outlineOpen, focusMode, isEditing } = useApp();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [outlineWidth, setOutlineWidth] = useState(220);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Focus mode toggle (only when not in input)
      if (e.key === 'f' && !isInputFocused()) {
        // Handled in context
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const showSidebar = sidebarOpen && !focusMode;
  const showOutline = outlineOpen && !focusMode;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
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
      }}>
        {/* Left Panel - File Explorer */}
        {showSidebar && (
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
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <NoteReader onHeadingsChange={setHeadings} />
          </div>
        </div>

        {/* Right Panel - Outline */}
        {showOutline && (
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
      {!focusMode && <StatusBar />}

      {/* Editor Overlay */}
      {isEditing && <EditorPane />}

      {/* Search Modal */}
      <SearchModal />
      <CreateModal />
      <ShortcutsModal />
    </div>
  );
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).contentEditable === 'true';
}

'use client';

import React, { useState } from 'react';
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

export default function Home() {
  const { sidebarOpen, outlineOpen, focusMode, isEditing } = useApp();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [noteMeta, setNoteMeta] = useState<NoteMeta | null>(null);
  const sidebarWidth = 260;
  const outlineWidth = 220;

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
            <ErrorBoundary fallbackTitle="Reader failed" fallbackMessage="The note reader hit an error while rendering this note.">
              <NoteReader onHeadingsChange={setHeadings} onMetaChange={setNoteMeta} />
            </ErrorBoundary>
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
      {!focusMode && <StatusBar noteMeta={noteMeta} />}

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

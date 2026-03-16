'use client';

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
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { sidebarOpen, outlineOpen, focusMode, isEditing } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {!focusMode && <Navbar />}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebarOpen && !focusMode && <FileExplorer />}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          {!focusMode && <TabBar />}
          <NoteReader />
        </div>
        {outlineOpen && !focusMode && <OutlinePanel />}
      </div>
      {!focusMode && <StatusBar />}
      {isEditing && <EditorPane />}
      <SearchModal />
      <CreateModal />
      <ShortcutsModal />
    </div>
  );
}

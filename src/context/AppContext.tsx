'use client';

import { createContext, useContext } from 'react';
import { NoteNode } from '@/lib/getNotesTree';

type AppContextValue = {
  tree: NoteNode[];
  activeNotePath: string | null;
  openTabs: string[];
  sidebarOpen: boolean;
  outlineOpen: boolean;
  focusMode: boolean;
  searchOpen: boolean;
  createModalOpen: boolean;
  isEditing: boolean;
  theme: string;
  setTree: (tree: NoteNode[]) => void;
  openNote: (path: string) => void;
  closeTab: (path: string) => void;
  toggleSidebar: () => void;
  toggleOutline: () => void;
  toggleFocusMode: () => void;
  toggleSearch: () => void;
  setCreateModalOpen: (open: boolean) => void;
  setIsEditing: (editing: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AppContext.Provider value={null as never}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NoteNode } from '@/lib/getNotesTree';

type AppState = {
  tree: NoteNode[];
  activeNotePath: string | null;
  openTabs: string[];
  sidebarOpen: boolean;
  outlineOpen: boolean;
  theme: string;
  focusMode: boolean;
  searchOpen: boolean;
  createModalOpen: boolean;
  isEditing: boolean;
  editorMode: 'new' | 'existing';
  editorNotePath: string | null;
  pickForEditor: boolean;
  splitViewActive: boolean;
  splitViewPath: string | null;
};

type AppContextType = AppState & {
  setTree: (tree: NoteNode[]) => void;
  openNote: (path: string) => void;
  closeTab: (path: string) => void;
  toggleSidebar: () => void;
  toggleOutline: () => void;
  setTheme: (theme: string) => void;
  toggleFocusMode: () => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setEditorMode: (mode: 'new' | 'existing') => void;
  setEditorNotePath: (path: string | null) => void;
  setPickForEditor: (pick: boolean) => void;
  toggleSplitView: () => void;
  setSplitViewPath: (path: string | null) => void;
};

const AppContext = createContext<AppContextType | null>(null);

const THEMES = ['dark-plus', 'light', 'sepia', 'catppuccin', 'nord'];
const THEME_LABELS: Record<string, string> = {
  'dark-plus': 'Dark+',
  'light': 'Light',
  'sepia': 'Sepia',
  'catppuccin': 'Catppuccin',
  'nord': 'Nord',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    tree: [],
    activeNotePath: null,
    openTabs: [],
    sidebarOpen: true,
    outlineOpen: true,
    theme: 'dark-plus',
    focusMode: false,
    searchOpen: false,
    createModalOpen: false,
    isEditing: false,
    editorMode: 'new',
    editorNotePath: null,
    pickForEditor: false,
    splitViewActive: false,
    splitViewPath: null,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = localStorage.getItem('nid-notes-state');
      if (!saved) {
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          activeNotePath: parsed.activeNotePath || null,
          openTabs: parsed.openTabs || [],
          sidebarOpen: parsed.sidebarOpen ?? true,
          outlineOpen: parsed.outlineOpen ?? true,
          theme: parsed.theme || 'dark-plus',
        }));
      } catch {
        // Ignore malformed persisted state.
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Persist state
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('nid-notes-state', JSON.stringify({
        activeNotePath: state.activeNotePath,
        openTabs: state.openTabs,
        sidebarOpen: state.sidebarOpen,
        outlineOpen: state.outlineOpen,
        theme: state.theme,
      }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [state.activeNotePath, state.openTabs, state.sidebarOpen, state.outlineOpen, state.theme]);

  const setTree = useCallback((tree: NoteNode[]) => {
    setState(prev => ({ ...prev, tree }));
  }, []);

  const openNote = useCallback((path: string) => {
    setState(prev => ({
      ...prev,
      activeNotePath: path,
      openTabs: prev.openTabs.includes(path) ? prev.openTabs : [...prev.openTabs, path],
    }));
  }, []);

  const closeTab = useCallback((path: string) => {
    setState(prev => {
      const newTabs = prev.openTabs.filter(t => t !== path);
      const newActive = prev.activeNotePath === path
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
        : prev.activeNotePath;
      return { ...prev, openTabs: newTabs, activeNotePath: newActive };
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleOutline = useCallback(() => {
    setState(prev => ({ ...prev, outlineOpen: !prev.outlineOpen }));
  }, []);

  const setTheme = useCallback((theme: string) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState(prev => ({ ...prev, focusMode: !prev.focusMode }));
  }, []);

  const toggleSearch = useCallback(() => {
    setState(prev => ({ ...prev, searchOpen: !prev.searchOpen }));
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, searchOpen: open }));
  }, []);

  const setCreateModalOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, createModalOpen: open }));
  }, []);

  const setIsEditing = useCallback((editing: boolean) => {
    setState(prev => ({ ...prev, isEditing: editing }));
  }, []);

  const setEditorMode = useCallback((mode: 'new' | 'existing') => {
    setState(prev => ({ ...prev, editorMode: mode }));
  }, []);

  const toggleSplitView = useCallback(() => {
    setState(prev => ({ ...prev, splitViewActive: !prev.splitViewActive }));
  }, []);

  const setSplitViewPath = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, splitViewPath: path }));
  }, []);

  const setEditorNotePath = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, editorNotePath: path }));
  }, []);

  const setPickForEditor = useCallback((pick: boolean) => {
    setState(prev => ({ ...prev, pickForEditor: pick }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setTree,
      openNote,
      closeTab,
      toggleSidebar,
      toggleOutline,
      setTheme,
      toggleFocusMode,
      toggleSearch,
      setSearchOpen,
      setCreateModalOpen,
      setIsEditing,
      setEditorMode,
      setEditorNotePath,
      setPickForEditor,
      toggleSplitView,
      setSplitViewPath,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { THEMES, THEME_LABELS };

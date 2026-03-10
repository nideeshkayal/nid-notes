export type NoteNode = {
  type: 'folder' | 'file';
  name: string;
  path: string;
  fullPath: string;
  frontmatter?: Record<string, unknown>;
  children?: NoteNode[];
};

export function getNotesTree(): NoteNode[] {
  return [];
}

export function getNoteContent() {
  return null;
}

export function getAllTags(): string[] {
  return [];
}

export function countNotes() {
  return { files: 0, folders: 0 };
}

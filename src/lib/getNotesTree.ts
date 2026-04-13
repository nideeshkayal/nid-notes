import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type NoteNode = {
  type: 'folder' | 'file';
  name: string;
  path: string;
  fullPath: string;
  frontmatter?: {
    title?: string;
    tags?: string[];
    pinned?: boolean;
    draft?: boolean;
    created?: string;
    updated?: string;
    author?: string;
    description?: string;
  };
  children?: NoteNode[];
};

const NOTES_DIR = path.join(process.cwd(), 'notes');

export function getNotesTree(dir: string = NOTES_DIR, basePath: string = ''): NoteNode[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes: NoteNode[] = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      const children = getNotesTree(fullPath, relativePath);
      nodes.push({
        type: 'folder',
        name: entry.name,
        path: relativePath,
        fullPath: `notes/${relativePath}`,
        children,
      });
    } else if (entry.name.endsWith('.md')) {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const { data } = matter(fileContent);
      const stats = fs.statSync(fullPath);
      const nameWithoutExt = entry.name.replace(/\.md$/, '');
      const filePath = basePath ? `${basePath}/${nameWithoutExt}` : nameWithoutExt;

      if (
        nameWithoutExt === 'untitled-note' &&
        stats.size < 32 &&
        fileContent.trim().startsWith('![')
      ) {
        continue;
      }
      
      nodes.push({
        type: 'file',
        name: entry.name,
        path: filePath,
        fullPath: `notes/${relativePath}`,
        frontmatter: {
          title: data.title,
          tags: data.tags,
          pinned: data.pinned,
          draft: data.draft,
          created: data.created ? String(data.created) : undefined,
          updated: data.updated ? String(data.updated) : undefined,
          author: data.author,
          description: data.description,
        },
      });
    }
  }
  
  // Sort: folders first, then files, alphabetically
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  return nodes;
}

export function getNoteContent(notePath: string): { content: string; lastModified: string; wordCount: number } | null {
  const fullPath = path.join(NOTES_DIR, `${notePath}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const stats = fs.statSync(fullPath);
  const { content: markdownContent } = matter(content);
  const wordCount = markdownContent.trim().split(/\s+/).filter(Boolean).length;
  
  return {
    content,
    lastModified: stats.mtime.toISOString(),
    wordCount,
  };
}

export function getAllTags(nodes: NoteNode[]): string[] {
  const tags = new Set<string>();
  
  function traverse(nodeList: NoteNode[]) {
    for (const node of nodeList) {
      if (node.type === 'file' && node.frontmatter?.tags) {
        node.frontmatter.tags.forEach(tag => tags.add(tag));
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  
  traverse(nodes);
  return Array.from(tags).sort();
}

export function countNotes(nodes: NoteNode[]): { files: number; folders: number } {
  let files = 0;
  let folders = 0;
  
  function traverse(nodeList: NoteNode[]) {
    for (const node of nodeList) {
      if (node.type === 'file') files++;
      if (node.type === 'folder') {
        folders++;
        if (node.children) traverse(node.children);
      }
    }
  }
  
  traverse(nodes);
  return { files, folders };
}

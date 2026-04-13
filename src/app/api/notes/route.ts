import { type NextRequest } from 'next/server';
import { getNotesTree, getNoteContent } from '@/lib/getNotesTree';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMarkdownToHtml } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

const noteHtmlCache = new Map<string, string>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const notePath = searchParams.get('path');
  const theme = searchParams.get('theme') || 'dark-plus';

  if (notePath) {
    const note = getNoteContent(notePath);
    if (!note) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }
    
    // Compile HTML
    const { content: mdContent, data: frontmatter } = matter(note.content);

    let html = '';
    try {
      const cacheKey = `${notePath}:${note.lastModified}:${theme}`;
      html = noteHtmlCache.get(cacheKey) || await compileMarkdownToHtml(mdContent, theme);
      if (!noteHtmlCache.has(cacheKey)) {
        noteHtmlCache.clear();
        noteHtmlCache.set(cacheKey, html);
      }
    } catch (err) {
      console.error('Error compiling markdown', err);
      html = `<p>Error compiling Markdown</p><pre>${mdContent}</pre>`;
    }

    return Response.json({ ...note, html, content: mdContent, frontmatter });
  }

  const tree = getNotesTree();
  return Response.json(tree);
}

export async function POST(request: Request) {
  try {
    const { path: notePath, content } = await request.json();
    
    if (!notePath || content === undefined) {
      return Response.json({ error: 'Path and content are required' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'notes', `${notePath}.md`);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');

    return Response.json({ success: true, path: notePath });
  } catch (error) {
    return Response.json({ error: 'Failed to save note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const notePath = searchParams.get('path');

  if (!notePath) {
    return Response.json({ error: 'Path is required' }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), 'notes', `${notePath}.md`);

  if (!fs.existsSync(fullPath)) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  try {
    fs.unlinkSync(fullPath);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

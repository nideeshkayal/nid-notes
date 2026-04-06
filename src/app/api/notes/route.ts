import { type NextRequest } from 'next/server';
import { getNotesTree, getNoteContent } from '@/lib/getNotesTree';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const notePath = searchParams.get('path');

  if (notePath) {
    const note = getNoteContent(notePath);
    if (!note) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }
    
    // Compile HTML
    const { content: mdContent, data: frontmatter } = matter(note.content);
    
    const mermaidBlocks: string[] = [];
    let processedContent = mdContent.replace(
      /^> \[!(NOTE|WARNING|TIP|DANGER)\]\n((?:> .*\n?)*)/gm,
      (match, type, content) => {
        return `\n<div class="callout callout-${type.toLowerCase()}">\n\n${content.replace(/^> /gm, '')}\n</div>\n`;
      }
    ).replace(
      /^```mermaid\n([\s\S]*?)```/gm,
      (match, content) => {
        mermaidBlocks.push(content);
        return `\n<div class="mermaid-placeholder" data-id="${mermaidBlocks.length - 1}"></div>\n`;
      }
    );

    let html = '';
    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeShiki, { theme: 'github-dark' })
        .use(rehypeKatex)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(processedContent);
      html = String(file);
      mermaidBlocks.forEach((content, i) => {
        html = html.replace(
          new RegExp(`<div class="mermaid-placeholder" data-id="${i}"></div>`, 'g'),
          `<div class="mermaid">${content}</div>`
        );
      });
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

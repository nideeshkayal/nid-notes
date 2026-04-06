import { type NextRequest } from 'next/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (typeof content !== 'string') {
      return Response.json({ html: '' });
    }

    const mermaidBlocks: string[] = [];
    let processedContent = content.replace(
      /^> \[!(NOTE|WARNING|TIP|DANGER)\]\n((?:> .*\n?)*)/gm,
      (match: string, type: string, calloutContent: string) => {
        return `\n<div class="callout callout-${type.toLowerCase()}">\n\n${calloutContent.replace(/^> /gm, '')}\n</div>\n`;
      }
    ).replace(
      /^```mermaid\n([\s\S]*?)```/gm,
      (match: string, content: string) => {
        mermaidBlocks.push(content);
        return `\n<div class="mermaid-placeholder" data-id="${mermaidBlocks.length - 1}"></div>\n`;
      }
    );

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
    let html = String(file);
    mermaidBlocks.forEach((content, i) => {
      html = html.replace(
        new RegExp(`<div class="mermaid-placeholder" data-id="${i}"></div>`, 'g'),
        `<div class="mermaid">${content}</div>`
      );
    });
    
    return Response.json({ html });
  } catch (err) {
    console.error('Compilation error', err);
    return Response.json({ html: `<p style="color:red">Error: ${String(err)}</p>` });
  }
}

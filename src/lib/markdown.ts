import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import type { Root } from 'hast';

const shikiCache = new Map<string, Root>();

export type MarkdownTheme = 'dark-plus' | 'light' | 'sepia' | 'catppuccin' | 'nord';

type MermaidBlock = {
  id: string;
  encoded: string;
};

function normalizeTheme(theme?: string): MarkdownTheme {
  switch (theme) {
    case 'light':
    case 'sepia':
    case 'catppuccin':
    case 'nord':
    case 'dark-plus':
      return theme;
    default:
      return 'dark-plus';
  }
}

function getShikiTheme(theme?: string) {
  const normalized = normalizeTheme(theme);
  return normalized === 'light' || normalized === 'sepia' ? 'github-light' : 'github-dark';
}

export function preprocessMarkdown(content: string) {
  const mermaidBlocks: MermaidBlock[] = [];

  const processedContent = content
    .replace(
      /^> \[!(NOTE|WARNING|TIP|DANGER|CAUTION|IMPORTANT)\]\r?\n((?:>.*(?:\r?\n|$))*)/gm,
      (_match, type: string, calloutContent: string) => {
        const body = calloutContent.replace(/^> ?/gm, '');
        return `\n<div class="callout callout-${type.toLowerCase()}">\n<div class="callout-title">${type}</div>\n\n${body}\n</div>\n`;
      }
    )
    .replace(
      /^```mermaid\r?\n([\s\S]*?)```/gm,
      (_match, mermaidContent: string) => {
        const id = `mermaid-${mermaidBlocks.length}`;
        mermaidBlocks.push({
          id,
          encoded: Buffer.from(mermaidContent, 'utf-8').toString('base64'),
        });
        return `\n<div class="mermaid-placeholder" data-id="${id}"></div>\n`;
      }
    );

  return { processedContent, mermaidBlocks };
}

export async function compileMarkdownToHtml(content: string, theme?: string) {
  const { processedContent, mermaidBlocks } = preprocessMarkdown(content);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeShiki, { theme: getShikiTheme(theme), cache: shikiCache })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(processedContent);

  let html = String(file);
  mermaidBlocks.forEach(({ id, encoded }) => {
    html = html.replace(
      new RegExp(`<div class="mermaid-placeholder" data-id="${id}"></div>`, 'g'),
      `<div class="mermaid" data-graph="${encoded}"></div>`
    );
  });

  return html;
}

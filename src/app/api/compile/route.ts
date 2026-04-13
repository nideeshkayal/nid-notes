import { type NextRequest } from 'next/server';
import { compileMarkdownToHtml } from '@/lib/markdown';

export async function POST(request: NextRequest) {
  try {
    const { content, theme } = await request.json();
    if (typeof content !== 'string') {
      return Response.json({ html: '' });
    }
    const html = await compileMarkdownToHtml(content, theme);
    return Response.json({ html });
  } catch (err) {
    console.error('Compilation error', err);
    return Response.json({ html: `<p style="color:red">Error: ${String(err)}</p>` });
  }
}

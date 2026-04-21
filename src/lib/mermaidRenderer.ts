function decodeMermaidGraph(value: string) {
  try {
    const binary = window.atob(value);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function getMermaidTheme(theme: string) {
  return theme === 'light' || theme === 'sepia' ? 'neutral' : 'dark';
}

let mermaidIdCounter = 0;

export async function renderMermaidIn(container: HTMLElement | null, theme: string) {
  if (!container) return;
  const mermaidEls = container.querySelectorAll<HTMLElement>('.mermaid');
  if (mermaidEls.length === 0) return;

  try {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, theme: getMermaidTheme(theme) });

    mermaidEls.forEach(el => {
      const graph = el.dataset.graph || '';
      el.removeAttribute('data-processed');
      if (!el.id) {
        el.id = `mermaid-graph-${++mermaidIdCounter}`;
      }
      el.innerHTML = '';
      el.textContent = decodeMermaidGraph(graph);
    });

    await mermaid.run({ nodes: Array.from(mermaidEls) });
  } catch (err) {
    console.error('Mermaid render error', err);
  }
}

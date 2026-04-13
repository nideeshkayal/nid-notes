export async function exportToPdf(printMode: 'note' | 'editor') {
  document.body.setAttribute('data-print-mode', printMode);
  await new Promise(resolve => window.setTimeout(resolve, 50));

  try {
    window.print();
  } finally {
    window.setTimeout(() => {
      document.body.removeAttribute('data-print-mode');
    }, 0);
  }
}

export function exportToMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

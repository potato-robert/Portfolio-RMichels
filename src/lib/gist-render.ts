import { codeToHtml } from 'shiki';
import { fetchGist } from './gist';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Shiki inserts newlines between line spans; inside <pre> that doubles vertical spacing. */
export function normalizeShikiHtml(html: string): string {
  return html.replace(/<\/span>\s*\n\s*<span class="line">/g, '</span><span class="line">');
}

async function renderGistFile(
  filename: string,
  language: string,
  content: string,
): Promise<string> {
  const highlighted = normalizeShikiHtml(
    await codeToHtml(content, {
      lang: language,
      theme: 'github-dark',
    }),
  );

  return `<figure class="code-snippet">
  <figcaption class="code-snippet-caption">${escapeHtml(filename)}</figcaption>
  <div class="code-snippet-body">${highlighted}</div>
</figure>`;
}

export async function renderGistHtml(gistId: string): Promise<string> {
  try {
    const gist = await fetchGist(gistId);
    const blocks = await Promise.all(
      gist.files.map((file) => renderGistFile(file.filename, file.language, file.content)),
    );

    return `${blocks.join('\n')}
<p class="code-snippet-meta"><a href="${escapeHtml(gist.url)}" target="_blank" rel="noopener noreferrer">View gist on GitHub</a></p>`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown gist fetch error';
    return `<p class="code-snippet-error">Code snippet unavailable (${escapeHtml(message)}).</p>`;
  }
}

export function findGistScriptTags(value: string): Array<{ full: string; id: string }> {
  const matches: Array<{ full: string; id: string }> = [];
  const pattern =
    /<script\s+src="https:\/\/gist\.github\.com\/[^/]+\/([a-f0-9]+)\.js"\s*><\/script>/gi;
  for (const match of value.matchAll(pattern)) {
    if (match[0] && match[1]) {
      matches.push({ full: match[0], id: match[1] });
    }
  }
  return matches;
}

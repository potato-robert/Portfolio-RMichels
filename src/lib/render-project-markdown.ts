import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { Locale } from './i18n';
import { transformExternalEmbeds } from './external-embeds';
import { remarkGistEmbed } from '../plugins/remark-gist-embed';

let processorPromise: ReturnType<typeof createMarkdownProcessor> | null = null;

async function getProcessor() {
  processorPromise ??= createMarkdownProcessor({
    remarkPlugins: [remarkGistEmbed],
    gfm: true,
    smartypants: true,
  });
  return processorPromise;
}

export async function renderProjectMarkdown(
  body: string,
  frontmatter: Record<string, unknown> = {},
  locale: Locale = 'en',
) {
  const processor = await getProcessor();
  const result = await processor.render(body, { frontmatter });
  const html = transformExternalEmbeds(result.code, locale);
  return {
    html,
    headings: result.metadata.headings,
  };
}

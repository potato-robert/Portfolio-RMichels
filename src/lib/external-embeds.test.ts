import { describe, expect, it } from 'vitest';
import { transformExternalEmbeds } from './external-embeds';

describe('transformExternalEmbeds', () => {
  it('replaces YouTube iframe with placeholder and nocookie src in data attrs', () => {
    const html =
      '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain('data-external-embed');
    expect(out).toContain('data-provider="youtube"');
    expect(out).toContain('youtube-nocookie.com');
    expect(out).not.toContain('<iframe');
  });

  it('preserves iframe class on placeholder wrapper', () => {
    const html =
      '<iframe class="clirioScanShareEmbed" src="https://clirioview-viw-prd.azurewebsites.net/guest/x"></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain('clirioScanShareEmbed');
    expect(out).toContain('data-provider="clirio"');
  });

  it('throws for unregistered third-party iframe', () => {
    const html = '<iframe src="https://evil.example.com/embed"></iframe>';
    expect(() => transformExternalEmbeds(html, 'en')).toThrow(/unregistered/);
  });
});

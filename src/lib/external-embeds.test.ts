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
    expect(out).toContain('data-iframe-title="YouTube (Google)"');
    expect(out).not.toContain('<iframe');
  });

  it('preserves iframe class on placeholder wrapper', () => {
    const html =
      '<iframe class="clirioScanShareEmbed" src="https://clirioview-viw-prd.azurewebsites.net/guest/x"></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain('clirioScanShareEmbed');
    expect(out).toContain('data-provider="clirio"');
  });

  it('decodes ampersand entities so the figma url query is a real ampersand', () => {
    const html =
      '<iframe src="https://www.figma.com/embed?embed_host=astra&#x26;url=https://www.figma.com/file/abc"></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain(
      'data-iframe-src="https://www.figma.com/embed?embed_host=astra&amp;url=https://www.figma.com/file/abc"',
    );
    expect(out).not.toContain('#x26');
  });

  it('does not double-escape an already escaped embed url', () => {
    const html =
      '<iframe src="https://www.figma.com/embed?embed_host=share&amp;url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fabc"></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain(
      'data-iframe-src="https://www.figma.com/embed?embed_host=share&amp;url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fabc"',
    );
    expect(out).not.toContain('&amp;amp;');
  });

  it('keeps allowfullscreen and grants the frame fullscreen permission', () => {
    const html =
      '<iframe src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fabc" allowfullscreen></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain('data-iframe-allowfullscreen=""');
    expect(out).toContain('data-iframe-allow="fullscreen"');
  });

  it('adds fullscreen to an existing allow policy when allowfullscreen is set', () => {
    const html =
      '<iframe title="YouTube video player" src="https://www.youtube.com/embed/abc123" allow="autoplay; picture-in-picture" allowfullscreen></iframe>';
    const out = transformExternalEmbeds(html, 'en');
    expect(out).toContain('data-iframe-allowfullscreen=""');
    expect(out).toContain('data-iframe-allow="autoplay; picture-in-picture; fullscreen"');
    expect(out).not.toContain('data-iframe-video');
  });

  it('throws for unregistered third-party iframe', () => {
    const html = '<iframe src="https://evil.example.com/embed"></iframe>';
    expect(() => transformExternalEmbeds(html, 'en')).toThrow(/unregistered/);
  });
});

import { describe, expect, it } from 'vitest';
import { guessShikiLanguage, parseGistId } from './gist';
import { normalizeShikiHtml } from './gist-render';

describe('normalizeShikiHtml', () => {
  it('removes newlines between shiki line spans', () => {
    const input = '<code><span class="line">a</span>\n<span class="line">b</span></code>';
    expect(normalizeShikiHtml(input)).toBe('<code><span class="line">a</span><span class="line">b</span></code>');
  });
});

describe('parseGistId', () => {
  it('extracts gist id from embed script url', () => {
    expect(
      parseGistId('https://gist.github.com/potato-robert/13bb15385194385ba5d5700ee224d858.js'),
    ).toBe('13bb15385194385ba5d5700ee224d858');
  });

  it('returns null for non-gist urls', () => {
    expect(parseGistId('https://example.com/script.js')).toBeNull();
  });
});

describe('guessShikiLanguage', () => {
  it('maps github language labels', () => {
    expect(guessShikiLanguage('TreeLerpSize.cs', 'C#')).toBe('csharp');
    expect(guessShikiLanguage('app.js', 'JavaScript')).toBe('javascript');
  });

  it('falls back to file extension', () => {
    expect(guessShikiLanguage('query.sql', null)).toBe('sql');
  });

  it('uses plain text when unknown', () => {
    expect(guessShikiLanguage('notes.txt', null)).toBe('text');
  });
});

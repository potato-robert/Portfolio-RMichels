import { describe, expect, it } from 'vitest';
import { shouldSkipLinkCheckUrl } from '../../audit/config/link-check-skip.ts';

describe('link check skip URLs', () => {
  it('skips known local audit exceptions', () => {
    expect(shouldSkipLinkCheckUrl('https://github.com/potato-robert/tourguide_app')).toBe(true);
    expect(shouldSkipLinkCheckUrl('https://www.linkedin.com/in/example/')).toBe(true);
  });

  it('does not skip normal internal links', () => {
    expect(shouldSkipLinkCheckUrl('http://127.0.0.1:4321/about')).toBe(false);
  });
});

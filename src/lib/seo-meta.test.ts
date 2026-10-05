import { describe, expect, it } from 'vitest';
import { clampMetaDescription, projectMetaDescription } from './seo-meta';

describe('clampMetaDescription', () => {
  it('truncates long text with ellipsis', () => {
    const long = 'a'.repeat(200);
    const out = clampMetaDescription(long, 160, 50);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('projectMetaDescription', () => {
  it('uses project body when long enough', () => {
    const body = 'A detailed case study about an interactive VR experience in Vancouver.';
    const out = projectMetaDescription('Siar', 'VR', body, 'en');
    expect(out).toBe(body);
  });
});

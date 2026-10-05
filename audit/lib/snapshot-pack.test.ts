import { describe, expect, it } from 'vitest';
import {
  lighthouseRawBasename,
  medianRunIndex,
  trimLhrForSnapshot,
} from './snapshot-pack.ts';

describe('snapshot-pack', () => {
  it('maps page paths to lighthouse raw basenames', () => {
    expect(lighthouseRawBasename('/', 'desktop', 2)).toBe('__desktop_2.json.gz');
    expect(lighthouseRawBasename('/about', 'mobile', 0)).toBe('_about_mobile_0.json.gz');
  });

  it('picks median run index', () => {
    expect(medianRunIndex(5)).toBe(2);
    expect(medianRunIndex(1)).toBe(0);
  });

  it('trims LHR to categories and audits without network dump', () => {
    const slim = trimLhrForSnapshot({
      finalUrl: 'https://example.com/',
      categories: { performance: { score: 0.9 } },
      audits: {
        'first-contentful-paint': { numericValue: 100, score: 1, title: 'FCP' },
        'network-requests': { details: { type: 'table', items: [{ url: 'x' }] } },
      },
    });
    expect(slim.categories).toBeDefined();
    expect((slim.audits as Record<string, unknown>)['first-contentful-paint']).toBeDefined();
    expect((slim.audits as Record<string, unknown>)['network-requests']).toBeDefined();
  });
});

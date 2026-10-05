import { describe, expect, it } from 'vitest';
import { buildJsonLdGraph } from './structured-data';

describe('buildJsonLdGraph', () => {
  it('includes WebSite and Person on home', () => {
    const graph = buildJsonLdGraph({
      pageType: 'home',
      siteUrl: 'https://rmichels.com',
      pageUrl: 'https://rmichels.com',
      locale: 'en',
    });
    const json = JSON.stringify(graph);
    expect(json).toContain('WebSite');
    expect(json).toContain('Person');
    expect(json).toContain('@graph');
  });

  it('includes ProfilePage and Person on about', () => {
    const graph = buildJsonLdGraph({
      pageType: 'about',
      siteUrl: 'https://rmichels.com',
      pageUrl: 'https://rmichels.com/about',
      locale: 'en',
    });
    const json = JSON.stringify(graph);
    expect(json).toContain('ProfilePage');
    expect(json).toContain('Person');
  });

  it('includes CreativeWork for project pages', () => {
    const graph = buildJsonLdGraph({
      pageType: 'project',
      siteUrl: 'https://rmichels.com',
      pageUrl: 'https://rmichels.com/tourguide',
      locale: 'en',
      creativeWork: {
        name: 'Tourguide',
        description: 'A tour guide app.',
        image: 'https://rmichels.com/assets/img/tourguide.jpg',
        url: 'https://rmichels.com/tourguide',
        inLanguage: 'en',
      },
    });
    const json = JSON.stringify(graph);
    expect(json).toContain('CreativeWork');
    expect(json).toContain('Tourguide');
  });
});

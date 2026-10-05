import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DE_SAMPLE_PROJECT_PATH,
  DEFAULT_EN_SAMPLE_PROJECT_PATH,
  pagesForDefaultAudit,
  type AuditPage,
} from './pages.ts';

function page(path: string, tags: AuditPage['tags'], locale: 'en' | 'de' = 'en', slug?: string): AuditPage {
  return { path, locale, htmlRel: 'x.html', tags, slug };
}

describe('pagesForDefaultAudit', () => {
  const inventory: AuditPage[] = [
    page('/', ['main', 'webgl-heavy']),
    page('/about', ['main']),
    page('/projects', ['main']),
    page('/futureEarth', ['main']),
    page('/tourguide', ['main', 'webgl-heavy']),
    page(DEFAULT_EN_SAMPLE_PROJECT_PATH, ['webgl-heavy'], 'en', 'clirioScanViews'),
    page('/pavilions', [], 'en', 'pavilions'),
    page('/de', ['main', 'webgl-heavy'], 'de'),
    page('/de/about', ['main'], 'de'),
    page('/de/projects', ['main'], 'de'),
    page('/de/futureEarth', ['main'], 'de', 'futureEarth'),
    page(DEFAULT_DE_SAMPLE_PROJECT_PATH, ['webgl-heavy'], 'de', 'clirioScanViews'),
    page('/de/pavilions', [], 'de', 'pavilions'),
    page('/privacyPolicy', ['legal']),
  ];

  it('keeps main EN routes, EN sample project, core DE, and one DE case study', () => {
    const paths = pagesForDefaultAudit(inventory).map((p) => p.path).sort();
    expect(paths).toEqual(
      [
        '/',
        '/about',
        '/clirioScanViews',
        '/de',
        '/de/about',
        '/de/clirioScanViews',
        '/de/projects',
        '/futureEarth',
        '/projects',
        '/tourguide',
      ].sort(),
    );
  });

  it('drops legal and non-sample DE case studies', () => {
    const paths = new Set(pagesForDefaultAudit(inventory).map((p) => p.path));
    expect(paths.has('/de/futureEarth')).toBe(false);
    expect(paths.has('/de/pavilions')).toBe(false);
    expect(paths.has('/privacyPolicy')).toBe(false);
    expect(paths.has('/pavilions')).toBe(false);
  });
});

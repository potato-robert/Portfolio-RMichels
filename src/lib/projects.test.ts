import { describe, expect, it } from 'vitest';
import type { ProjectEntry } from './projects';
import {
  filterByStack,
  formatProjectYear,
  getLocalized,
  getProjectSlug,
  HOME_FEATURED_SLUG_ORDER,
  projectToTileData,
} from './projects';

function mockProject(
  id: string,
  data: Partial<ProjectEntry['data']> & Pick<ProjectEntry['data'], 'name' | 'format'>,
): ProjectEntry {
  return {
    id,
    slug: id.replace(/\.md$/i, ''),
    body: '',
    collection: 'projects',
    data: {
      year: '2024',
      inDevelopment: false,
      stack: ['unity'],
      description: { en: '', de: '' },
      ...data,
    },
  } as ProjectEntry;
}

describe('HOME_FEATURED_SLUG_ORDER', () => {
  it('lists featured home slugs including canfit after tourguide', () => {
    expect(HOME_FEATURED_SLUG_ORDER.slice(0, 2)).toEqual(['tourguide', 'canfit']);
    expect(HOME_FEATURED_SLUG_ORDER).not.toContain('clirioScanShare');
  });
});

describe('getProjectSlug', () => {
  it('strips .md extension from project id', () => {
    const project = mockProject('futureEarth.md', {
      name: { en: 'Future Earth', de: 'Future Earth' },
      format: 'game',
    });
    expect(getProjectSlug(project)).toBe('futureEarth');
  });
});

describe('formatProjectYear', () => {
  it('returns a closed range unchanged', () => {
    expect(formatProjectYear('2021–2024', false, 'present')).toBe('2021–2024');
  });

  it('appends a localized present label for ongoing work', () => {
    expect(formatProjectYear('2025', true, 'present')).toBe('2025–present');
    expect(formatProjectYear('2025', true, 'heute')).toBe('2025–heute');
  });
});

describe('getLocalized', () => {
  const field = { en: 'Hello', de: 'Hallo' };

  it('returns en for English locale', () => {
    expect(getLocalized(field, 'en')).toBe('Hello');
  });

  it('returns de for German locale', () => {
    expect(getLocalized(field, 'de')).toBe('Hallo');
  });

  it('falls back to en when de is empty', () => {
    expect(getLocalized({ en: 'Hello', de: '' }, 'de')).toBe('Hello');
  });

  it('returns empty string when field is undefined', () => {
    expect(getLocalized(undefined, 'en')).toBe('');
  });
});

describe('filterByStack', () => {
  const unityProject = mockProject('futureEarth.md', {
    name: { en: 'Future Earth', de: 'Future Earth' },
    format: 'game',
    stack: ['unity', 'csharp'],
  });
  const webProject = mockProject('amae.md', {
    name: { en: 'Amae', de: 'Amae' },
    format: 'prototype',
    stack: ['figma'],
  });
  const projects = [unityProject, webProject];

  it('returns all projects when no slug is set', () => {
    expect(filterByStack(projects, null)).toEqual(projects);
    expect(filterByStack(projects, '')).toEqual(projects);
  });

  it('matches projects that include the stack slug', () => {
    expect(filterByStack(projects, 'unity')).toEqual([unityProject]);
    expect(filterByStack(projects, 'csharp')).toEqual([unityProject]);
    expect(filterByStack(projects, 'figma')).toEqual([webProject]);
  });

  it('returns empty when no project matches', () => {
    expect(filterByStack(projects, 'blazor')).toEqual([]);
  });
});

describe('projectToTileData', () => {
  it('maps a published project to tile data with slug href', () => {
    const project = mockProject('futureEarth.md', {
      name: { en: 'Future Earth', de: 'Future Earth' },
      format: 'game',
      stack: ['unity', 'csharp'],
    });

    expect(projectToTileData(project, 'en')).toEqual({
      slug: 'futureEarth',
      name: 'Future Earth',
      type: 'Game',
      inDevelopment: false,
      stack: ['unity', 'csharp'],
      href: '/futureEarth',
    });
  });

  it('prefixes href with /de for German locale', () => {
    const project = mockProject('futureEarth.md', {
      name: { en: 'Future Earth', de: 'Future Earth' },
      format: 'game',
    });

    expect(projectToTileData(project, 'de').href).toBe('/de/futureEarth');
    expect(projectToTileData(project, 'de').type).toBe('Spiel');
  });

  it('routes published tourguide to /tourguide', () => {
    const project = mockProject('tourguide.md', {
      name: { en: 'Tourguide', de: 'Tourguide' },
      format: 'cross-platform-app',
      inDevelopment: false,
      stack: ['flutter'],
    });

    expect(projectToTileData(project, 'en')).toMatchObject({
      slug: 'tourguide',
      inDevelopment: false,
      href: '/tourguide',
    });
    expect(projectToTileData(project, 'de').href).toBe('/de/tourguide');
  });
});

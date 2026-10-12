import { describe, expect, it } from 'vitest';
import type { ProjectEntry } from './projects';
import {
  filterByRoles,
  getLocalized,
  getProjectSlug,
  HOME_FEATURED_SLUG_ORDER,
  projectToTileData,
} from './projects';

function mockProject(
  id: string,
  data: Partial<ProjectEntry['data']> & Pick<ProjectEntry['data'], 'name' | 'projectType'>,
): ProjectEntry {
  return {
    id,
    slug: id.replace(/\.md$/i, ''),
    body: '',
    collection: 'projects',
    data: {
      year: '2024',
      inDevelopment: false,
      roles: [],
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
      projectType: { en: 'VR Game', de: 'VR-Spiel' },
    });
    expect(getProjectSlug(project)).toBe('futureEarth');
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

describe('filterByRoles', () => {
  const vrProject = mockProject('futureEarth.md', {
    name: { en: 'Future Earth', de: 'Future Earth' },
    projectType: { en: 'VR Game', de: 'VR-Spiel' },
    roles: ['vr', 'game'],
  });
  const webProject = mockProject('amae.md', {
    name: { en: 'Amae', de: 'Amae' },
    projectType: { en: 'Web App', de: 'Web App' },
    roles: ['design', 'front-end'],
  });
  const projects = [vrProject, webProject];

  it('returns all projects when filters are empty', () => {
    expect(filterByRoles(projects, [])).toEqual(projects);
  });

  it('matches projects with any filter role (OR logic)', () => {
    expect(filterByRoles(projects, ['vr'])).toEqual([vrProject]);
    expect(filterByRoles(projects, ['design'])).toEqual([webProject]);
    expect(filterByRoles(projects, ['vr', 'design'])).toEqual(projects);
  });

  it('does not require all filter roles on a project (not AND)', () => {
    expect(filterByRoles(projects, ['vr', 'game', 'design'])).toEqual(projects);
    expect(filterByRoles(projects, ['vr', 'front-end'])).toEqual(projects);
  });

  it('returns empty when no project matches', () => {
    expect(filterByRoles(projects, ['android'])).toEqual([]);
  });
});

describe('projectToTileData', () => {
  it('maps a published project to tile data with slug href', () => {
    const project = mockProject('futureEarth.md', {
      name: { en: 'Future Earth', de: 'Future Earth' },
      projectType: { en: 'VR Game', de: 'VR-Spiel' },
      roles: ['vr'],
    });

    expect(projectToTileData(project, 'en')).toEqual({
      slug: 'futureEarth',
      name: 'Future Earth',
      type: 'VR Game',
      inDevelopment: false,
      roles: ['vr'],
      href: '/futureEarth',
    });
  });

  it('prefixes href with /de for German locale', () => {
    const project = mockProject('futureEarth.md', {
      name: { en: 'Future Earth', de: 'Future Earth' },
      projectType: { en: 'VR Game', de: 'VR-Spiel' },
      roles: ['vr'],
    });

    expect(projectToTileData(project, 'de').href).toBe('/de/futureEarth');
  });

  it('routes published tourguide to /tourguide', () => {
    const project = mockProject('tourguide.md', {
      name: { en: 'Tourguide', de: 'Tourguide' },
      projectType: { en: 'Flutter App', de: 'Flutter App' },
      inDevelopment: false,
      roles: ['android', 'design'],
    });

    expect(projectToTileData(project, 'en')).toMatchObject({
      slug: 'tourguide',
      inDevelopment: false,
      href: '/tourguide',
    });
    expect(projectToTileData(project, 'de').href).toBe('/de/tourguide');
  });
});

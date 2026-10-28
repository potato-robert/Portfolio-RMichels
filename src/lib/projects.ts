import { getCollection, type CollectionEntry } from 'astro:content';
import { getFormatLabel } from './formats';
import type { Locale } from './i18n';

export type ProjectEntry =
  | CollectionEntry<'projects'>
  | CollectionEntry<'projects-de'>;

/** Featured home tile order (also guides `order` frontmatter for these slugs). */
export const HOME_FEATURED_SLUG_ORDER = [
  'tourguide',
  'canfit',
  'clirioScanViews',
  'clirioCloud',
  'futureEarth',
  'amae',
] as const;

/** Public URL slug (camelCase, no .md suffix). */
export function getProjectSlug(project: ProjectEntry): string {
  return project.id.replace(/\.md$/i, '');
}

export function getLocalized(
  field: { en: string; de: string } | undefined,
  locale: Locale,
): string {
  if (!field) return '';
  return locale === 'de' ? field.de || field.en : field.en;
}

export async function getAllProjects(locale: Locale = 'en'): Promise<ProjectEntry[]> {
  const collection = locale === 'de' ? 'projects-de' : 'projects';
  const projects = await getCollection(collection, ({ data }) => !data.draft);
  return projects.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}

export async function getProjects(locale: Locale = 'en'): Promise<ProjectEntry[]> {
  return getAllProjects(locale);
}

export async function getHomeProjects(locale: Locale = 'en'): Promise<ProjectEntry[]> {
  const projects = await getAllProjects(locale);
  return projects.filter((p) => !p.data.hideFromHome);
}

export function filterByStack(projects: ProjectEntry[], slug: string | null): ProjectEntry[] {
  if (!slug) return projects;
  return projects.filter((p) => (p.data.stack as readonly string[]).includes(slug));
}

/** Closed ranges are stored as written. Open ranges append a localized "present" label. */
export function formatProjectYear(year: string, ongoing: boolean, presentLabel: string): string {
  if (!ongoing) return year;
  return `${year}–${presentLabel}`;
}

export function projectToTileData(project: ProjectEntry, locale: Locale) {
  const slug = getProjectSlug(project);
  const prefix = locale === 'de' ? '/de' : '';
  return {
    slug,
    name: getLocalized(project.data.name, locale),
    type: getFormatLabel(project.data.format, locale),
    inDevelopment: project.data.inDevelopment,
    stack: project.data.stack,
    href: project.data.inDevelopment ? `${prefix}/development/${slug}` : `${prefix}/${slug}`,
  };
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale = 'en'
): Promise<ProjectEntry | undefined> {
  const projects = await getAllProjects(locale);
  return projects.find((p) => getProjectSlug(p) === slug);
}

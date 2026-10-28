import type { Locale } from './i18n';

/** Closed vocabulary for the tile subtitle and the case-study Format column. */
export const formatSlugs = [
  'desktop-app',
  'op-cad-desktop-app',
  'web-app',
  'cross-platform-app',
  'xr-app',
  'xr-gis-app',
  'game',
  'xr-game',
  'data-visualization',
  'prototype',
  'spatial-design',
] as const;

export type FormatSlug = (typeof formatSlugs)[number];

export interface Format {
  slug: FormatSlug;
  name: { en: string; de: string };
}

export const formats: Format[] = [
  { slug: 'desktop-app', name: { en: 'Desktop app', de: 'Desktop-App' } },
  { slug: 'op-cad-desktop-app', name: { en: 'O&P CAD desktop app', de: 'O&P-CAD-Desktop-App' } },
  { slug: 'web-app', name: { en: 'Web app', de: 'Web-App' } },
  { slug: 'cross-platform-app', name: { en: 'Cross platform app', de: 'Plattformübergreifende App' } },
  { slug: 'xr-app', name: { en: 'XR app', de: 'XR-App' } },
  { slug: 'xr-gis-app', name: { en: 'XR GIS app', de: 'XR-GIS-App' } },
  { slug: 'game', name: { en: 'Game', de: 'Spiel' } },
  { slug: 'xr-game', name: { en: 'XR game', de: 'XR-Spiel' } },
  { slug: 'data-visualization', name: { en: 'Data visualization', de: 'Datenvisualisierung' } },
  { slug: 'prototype', name: { en: 'UX prototype', de: 'UX-Prototyp' } },
  { slug: 'spatial-design', name: { en: 'Spatial design', de: 'Raumgestaltung' } },
];

export function getFormatBySlug(slug: string): Format | undefined {
  return formats.find((format) => format.slug === slug);
}

export function getFormatLabel(slug: string, locale: Locale): string {
  const format = getFormatBySlug(slug);
  if (!format) return slug;
  return locale === 'de' ? format.name.de : format.name.en;
}

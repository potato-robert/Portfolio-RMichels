import type { Locale } from './i18n';

export const CONTACT_EMAIL = 'hi@rmichels.com';
export const CONTROLLER_NAME = 'Robert Michels';
export const CONTROLLER_LOCATION = 'British Columbia, Canada';

/** ISO date — update when the privacy policy changes materially. */
export const PRIVACY_LAST_UPDATED_ISO = '2026-10-01';

export function formatPrivacyLastUpdated(locale: Locale): string {
  const date = new Date(`${PRIVACY_LAST_UPDATED_ISO}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export type ExternalMediaProvider = {
  id: string;
  displayName: string;
  privacyUrl: string;
};

export const EXTERNAL_MEDIA_PROVIDERS: ExternalMediaProvider[] = [
  {
    id: 'youtube',
    displayName: 'YouTube (Google)',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    id: 'sketchfab',
    displayName: 'Sketchfab',
    privacyUrl: 'https://sketchfab.com/privacy',
  },
  {
    id: 'figma',
    displayName: 'Figma',
    privacyUrl: 'https://www.figma.com/legal/privacy/',
  },
  {
    id: 'clirio',
    displayName: 'Clirio View (Azure)',
    privacyUrl: 'https://privacy.microsoft.com/',
  },
];

export const EXTERNAL_MEDIA_STORAGE_KEY = 'rmExternalMedia';

import type { Locale } from './i18n';

/** Legal / privacy contact (portfolio general contact remains hi@ in footer). */
export const CONTACT_EMAIL = 'contact@rmichels.com';
export const CONTROLLER_NAME = 'Robert Michels';
export const CONTROLLER_LOCATION = 'British Columbia, Canada';

/** ISO date — update when the privacy policy changes materially. */
export const PRIVACY_LAST_UPDATED_ISO = '2026-10-03';

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

export function getPrivacyPolicyPath(locale: Locale): string {
  return locale === 'de' ? '/de/privacyPolicy' : '/privacyPolicy';
}

export function getPrivacySettingsPath(locale: Locale): string {
  return locale === 'de' ? '/de/privacySettings' : '/privacySettings';
}

/**
 * One-time cleanup for visitors who received cookies from the old GA / consent banner.
 * Safe to remove after ~2028-10-01 (GA cookies can persist up to ~2 years).
 */
const LEGACY_COOKIE_NAMES = ['_ga', '_ga_WXGTTGWVKL', 'rmCookieConsent', 'visitorFilter'];

function expireCookie(name: string, domain?: string): void {
  const base = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = base;
  if (domain) {
    document.cookie = `${base}; domain=${domain}`;
  }
}

export function cleanupLegacyCookies(): void {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname;
  const isRmichels =
    hostname === 'rmichels.com' || hostname.endsWith('.rmichels.com');

  for (const name of LEGACY_COOKIE_NAMES) {
    expireCookie(name);
    if (isRmichels) {
      expireCookie(name, '.rmichels.com');
    }
  }
}

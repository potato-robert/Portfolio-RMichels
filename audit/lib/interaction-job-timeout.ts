import type { AuditPage } from '../config/pages.ts';
import type { AuditProfile } from '../config/profiles.ts';

export const DEFAULT_INTERACTION_JOB_TIMEOUT_MS = 240_000;
export const WEBKIT_WEBGL_INTERACTION_JOB_TIMEOUT_MS = 180_000;

export function pageNeedsIsolatedBrowser(auditPage: AuditPage): boolean {
  return auditPage.tags.includes('webgl-heavy');
}

export function interactionJobTimeoutMs(
  profile: AuditProfile,
  auditPage: AuditPage,
  overrideMs?: number,
): number {
  if (overrideMs !== undefined && overrideMs > 0) return overrideMs;
  if (profile.browser === 'webkit' && pageNeedsIsolatedBrowser(auditPage)) {
    return WEBKIT_WEBGL_INTERACTION_JOB_TIMEOUT_MS;
  }
  return DEFAULT_INTERACTION_JOB_TIMEOUT_MS;
}

import type { AuditProfile } from '../config/profiles.ts';

/** Local interaction / audit URLs (`perf=1`, optional forced tier). */
export function buildInteractionUrl(
  baseUrl: string,
  pagePath: string,
  profile?: Pick<AuditProfile, 'expectedTier'>,
): string {
  const root = baseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ perf: '1' });
  if (profile?.expectedTier) {
    params.set('auditTier', profile.expectedTier);
  }
  const qs = params.toString();
  if (pagePath === '/') return `${root}/?${qs}`;
  return `${root}${pagePath}?${qs}`;
}

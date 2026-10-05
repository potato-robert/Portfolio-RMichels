import { describe, expect, it } from 'vitest';
import type { AuditPage } from '../config/pages.ts';
import type { AuditProfile } from '../config/profiles.ts';
import {
  DEFAULT_INTERACTION_JOB_TIMEOUT_MS,
  WEBKIT_WEBGL_INTERACTION_JOB_TIMEOUT_MS,
  interactionJobTimeoutMs,
} from './interaction-job-timeout.ts';

function auditPage(path: string, tags: AuditPage['tags']): AuditPage {
  return { path, locale: 'en', htmlRel: 'x.html', tags };
}

const webkitProfile = { browser: 'webkit' } as AuditProfile;
const chromiumProfile = { browser: 'chromium' } as AuditProfile;

describe('interactionJobTimeoutMs', () => {
  it('uses override when set', () => {
    expect(
      interactionJobTimeoutMs(chromiumProfile, auditPage('/tourguide', ['webgl-heavy']), 90_000),
    ).toBe(90_000);
  });

  it('uses shorter budget for WebKit webgl-heavy', () => {
    expect(
      interactionJobTimeoutMs(webkitProfile, auditPage('/tourguide', ['webgl-heavy'])),
    ).toBe(WEBKIT_WEBGL_INTERACTION_JOB_TIMEOUT_MS);
  });

  it('uses default for Chromium main routes', () => {
    expect(interactionJobTimeoutMs(chromiumProfile, auditPage('/', ['main']))).toBe(
      DEFAULT_INTERACTION_JOB_TIMEOUT_MS,
    );
  });
});

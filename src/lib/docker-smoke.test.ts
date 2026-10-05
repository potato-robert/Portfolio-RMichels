import { describe, expect, it } from 'vitest';
import {
  pickDockerSmokeProfile,
  shouldRunDockerSmoke,
} from '../../audit/lib/docker-smoke.ts';
import type { AuditProfile } from '../../audit/config/profiles.ts';

const dockerProfile: AuditProfile = {
  id: 'docker-2cpu-2gb',
  label: 'Docker',
  browser: 'chromium',
  viewport: { width: 1366, height: 768 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  cpuThrottleRate: 1,
  network: 'cable',
  gpuMode: 'swiftshader',
  docker: { cpus: '2', memory: '2g' },
};

describe('docker smoke gating', () => {
  it('runs only for local full interaction with Docker profiles', () => {
    expect(
      shouldRunDockerSmoke({
        target: 'local',
        stages: new Set(['ci-gate', 'lighthouse', 'seo', 'interaction']),
        profiles: [dockerProfile],
      }),
    ).toBe(true);
    expect(
      shouldRunDockerSmoke({
        target: 'prod',
        stages: new Set(['interaction']),
        profiles: [dockerProfile],
      }),
    ).toBe(false);
    expect(
      shouldRunDockerSmoke({
        target: 'local',
        stages: new Set(['lighthouse']),
        profiles: [dockerProfile],
      }),
    ).toBe(false);
  });

  it('prefers docker-2cpu-2gb for the probe', () => {
    const other: AuditProfile = {
      ...dockerProfile,
      id: 'docker-1cpu-1gb',
      docker: { cpus: '1', memory: '1g' },
    };
    expect(pickDockerSmokeProfile([other, dockerProfile])?.id).toBe('docker-2cpu-2gb');
  });
});

import { describe, expect, it } from 'vitest';
import { formatAuditRunLogSummary } from './run-log-summary.ts';
import type { AuditManifest } from './snapshot.ts';

const baseManifest: AuditManifest = {
  runId: '2026-01-01T00-00-00-000Z_abc1234_full_local',
  gitSha: 'abc1234567890',
  gitBranch: 'dev',
  dirty: false,
  target: 'local',
  level: 'full',
  label: 'local',
  profiles: ['desktop-full-hd'],
  stages: ['ci-gate', 'lighthouse', 'seo', 'interaction'],
  host: {
    hostname: 'test',
    cpuModel: 'test',
    cores: 8,
    totalMemoryGb: 16,
    platform: 'win32',
    arch: 'x64',
    osRelease: 'test',
    gpuHint: null,
    nodeVersion: 'v22.12.0',
  },
  versions: { node: 'v22.12.0', lighthouse: '12.0.0', playwright: '1.49.0' },
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: '2026-01-01T00:10:00.000Z',
  status: 'success',
};

describe('formatAuditRunLogSummary', () => {
  it('includes lighthouse averages and slowest LCP', () => {
    const text = formatAuditRunLogSummary(baseManifest, {
      ciGate: {
        passed: true,
        commands: [{ name: 'test:all', exitCode: 0, durationMs: 45_000 }],
      },
      lighthouse: {
        benchmarkIndex: 1200,
        pages: [
          {
            page: '/',
            preset: 'mobile',
            runs: 5,
            metrics: { lcp: 2000, fcp: 800, tbt: 100, cls: 0.01 },
            categories: { performance: 95, accessibility: 100, bestPractices: 100, seo: 100 },
          },
          {
            page: '/tourguide',
            preset: 'mobile',
            runs: 5,
            metrics: { lcp: 3000, fcp: 900, tbt: 150, cls: 0.02 },
            categories: { performance: 88, accessibility: 98, bestPractices: 100, seo: 100 },
          },
        ],
      },
      interaction: {
        profiles: [
          {
            profileId: 'desktop-full-hd',
            page: '/',
            scenarios: [
              { scenario: 'cold-load', metrics: { durationMs: 1100 } },
              { scenario: 'scroll', metrics: { effectiveFps: 58, p95: 40, droppedFramePct: 2 } },
            ],
          },
        ],
      },
      seo: { findings: [{ severity: 'warning', page: '/', rule: 'x', detail: 'y' }] },
    });

    expect(text).toContain('AUDIT RUN SUMMARY');
    expect(text).toContain('(↑) higher is better · (↓) lower is better');
    expect(text).toContain('LCP (↓) 2500ms');
    expect(text).toContain('Slowest LCP (↓)');
    expect(text).toContain('/tourguide');
    expect(text).toContain('avg FPS (↑) 58.0');
    expect(text).toContain('CI GATE');
    expect(text).toContain('PASSED');
  });

  it('surfaces failure stage in header', () => {
    const text = formatAuditRunLogSummary(
      { ...baseManifest, status: 'failed' },
      { failure: { stage: 'ci-gate', message: 'tests failed' } },
    );
    expect(text).toContain('[ci-gate] tests failed');
  });
});

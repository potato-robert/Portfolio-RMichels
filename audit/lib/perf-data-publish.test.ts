import { describe, expect, it } from 'vitest';
import {
  auditStagesRecordedInSummary,
  PERF_DATA_LOCAL_EXCLUDE_LINES,
} from './perf-data-publish.ts';
import {
  isSubstantiveRunSnapshot,
  shouldPublishCompleteSnapshot,
} from './snapshot-substance.ts';

describe('perf-data publish rules', () => {
  it('requires each configured stage in summary', () => {
    const stages = ['ci-gate', 'lighthouse', 'seo', 'interaction'];
    expect(
      auditStagesRecordedInSummary(stages, {
        ciGate: {},
        lighthouse: {},
        seo: {},
        interaction: {},
      }),
    ).toBe(true);
    expect(
      auditStagesRecordedInSummary(stages, {
        ciGate: {},
        lighthouse: {},
        seo: {},
      }),
    ).toBe(false);
  });

  it('publishes only full successful runs with all stages', () => {
    const stages = new Set(['ci-gate', 'lighthouse', 'seo', 'interaction']);
    const fullSummary = {
      ciGate: {},
      lighthouse: {},
      seo: {},
      interaction: {},
    };
    expect(
      shouldPublishCompleteSnapshot({
        status: 'success',
        level: 'full',
        stages,
        summary: fullSummary,
      }),
    ).toBe(true);
    expect(
      shouldPublishCompleteSnapshot({
        status: 'success',
        level: 'quick',
        stages,
        summary: fullSummary,
      }),
    ).toBe(false);
    expect(
      shouldPublishCompleteSnapshot({
        status: 'failed',
        level: 'full',
        stages,
        summary: fullSummary,
      }),
    ).toBe(false);
  });

  it('excludes local run trees via info/exclude', () => {
    expect(PERF_DATA_LOCAL_EXCLUDE_LINES).toContain('runs/');
  });

  it('keeps partial local runs with raw files', () => {
    expect(isSubstantiveRunSnapshot({ summary: {}, rawFileCount: 2 })).toBe(true);
  });
});

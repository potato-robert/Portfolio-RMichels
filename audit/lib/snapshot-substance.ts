import { auditStagesRecordedInSummary } from './perf-data-publish.ts';

/** Stage keys written to summary.json when a stage actually ran. */
export const AUDIT_SUMMARY_STAGE_KEYS = [
  'ciGate',
  'dockerSmoke',
  'lighthouse',
  'seo',
  'interaction',
] as const;

export type AuditSummaryStageKey = (typeof AUDIT_SUMMARY_STAGE_KEYS)[number];

export function summaryHasStageData(summary: Record<string, unknown>): boolean {
  return AUDIT_SUMMARY_STAGE_KEYS.some((key) => summary[key] != null);
}

/** True when a run folder is worth keeping on disk (partial or complete). */
export function isSubstantiveRunSnapshot(params: {
  summary: Record<string, unknown>;
  rawFileCount: number;
}): boolean {
  const { summary, rawFileCount } = params;
  if (rawFileCount > 0) return true;
  return summaryHasStageData(summary);
}

/**
 * Publish slim snapshot to `perf-data` only for a **full** successful audit with all
 * configured stages recorded in summary (local `runs/` + `raw/` stay uncommitted).
 */
export function shouldPublishCompleteSnapshot(params: {
  status: 'success' | 'failed' | 'aborted' | undefined;
  level: 'quick' | 'full';
  stages: Iterable<string>;
  summary: Record<string, unknown>;
}): boolean {
  if (params.status !== 'success' || params.level !== 'full') return false;
  return auditStagesRecordedInSummary(params.stages, params.summary);
}

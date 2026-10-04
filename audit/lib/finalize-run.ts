import fs from 'node:fs';
import path from 'node:path';
import { generateRunReportHtml } from '../report.ts';
import type { AuditProfile } from '../config/profiles.ts';
import {
  appendHistory,
  commitRun,
  writeManifest,
  writeSummary,
  type AuditManifest,
} from './snapshot.ts';
import { fingerprintKey, getHostFingerprint, readPackageVersion } from './host.ts';
import type { PreflightResult } from './preflight.ts';

export interface AuditFailure {
  stage: string;
  message: string;
  stack?: string;
}

export function serializeAuditError(err: unknown): AuditFailure {
  if (err instanceof Error) {
    return { stage: 'unknown', message: err.message, stack: err.stack };
  }
  return { stage: 'unknown', message: String(err) };
}

export function finalizeAuditRun(params: {
  runDir: string;
  runId: string;
  worktree: string;
  opts: {
    target: 'local' | 'prod';
    level: 'quick' | 'full';
    label: string;
    stages: Set<string>;
  };
  profileList: AuditProfile[];
  summary: Record<string, unknown>;
  git: { sha: string; branch: string; dirty: boolean };
  exitCode: number;
  benchmarkIndex?: number;
  startedAt: string;
  preflight?: PreflightResult;
  failure?: AuditFailure;
}): void {
  const {
    runDir,
    runId,
    worktree,
    opts,
    profileList,
    summary,
    git,
    exitCode,
    benchmarkIndex,
    startedAt,
    preflight,
    failure,
  } = params;

  if (preflight) summary.preflight = preflight;
  if (failure) summary.failure = failure;

  const host = getHostFingerprint(benchmarkIndex);
  const completedAt = new Date().toISOString();
  const status =
    exitCode === 0
      ? 'success'
      : failure?.stage === 'aborted' || exitCode === 130
        ? 'aborted'
        : 'failed';

  const manifest: AuditManifest = {
    runId,
    gitSha: git.sha,
    gitBranch: git.branch,
    dirty: git.dirty,
    target: opts.target,
    level: opts.level,
    label: opts.label,
    profiles: profileList.map((p) => p.id),
    stages: [...opts.stages],
    host,
    versions: {
      node: process.version,
      lighthouse: readPackageVersion('lighthouse'),
      playwright: readPackageVersion('@playwright/test'),
    },
    createdAt: startedAt,
    completedAt,
    status,
    failure: failure ? { stage: failure.stage, message: failure.message } : undefined,
  };

  writeManifest(runDir, manifest);
  writeSummary(runDir, summary);

  const reportHtml = generateRunReportHtml(manifest, summary);
  fs.writeFileSync(path.join(runDir, 'report.html'), reportHtml);

  appendHistory(worktree, {
    runId,
    createdAt: startedAt,
    completedAt,
    status,
    gitSha: git.sha,
    level: opts.level,
    target: opts.target,
    hostKey: fingerprintKey(host),
    label: opts.label,
    failureStage: failure?.stage,
  });

  const fp = fingerprintKey(host).replace(/\|/g, '_');
  commitRun(worktree, `audit: ${git.sha.slice(0, 7)} ${opts.level} ${fp} ${status}`);

  if (exitCode === 0) {
    console.log(`Audit complete: ${runDir}`);
  } else {
    console.error(`Audit failed (exit ${exitCode}): ${runDir}`);
    if (failure) {
      console.error(`Failed stage: ${failure.stage}`);
      console.error(failure.message);
    }
  }
}

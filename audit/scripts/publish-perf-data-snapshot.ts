#!/usr/bin/env node
/**
 * Manual: merge dev into perf-data, then append one commit updating snapshot/latest/
 * from a successful full local audit run (default: latest under .perf-data/runs/).
 */
import fs from 'node:fs';
import path from 'node:path';
import { getWorktreePath, readManifest } from '../lib/snapshot.ts';
import { appendPerfDataSnapshotCommit } from '../lib/perf-data-publish.ts';
import { shouldPublishCompleteSnapshot } from '../lib/snapshot-substance.ts';
import { fingerprintKey, getHostFingerprint } from '../lib/host.ts';

const worktree = getWorktreePath();
const runsDir = path.join(worktree, 'runs');
const argRunId = process.argv[2];

function listSuccessfulFullRuns(): string[] {
  if (!fs.existsSync(runsDir)) return [];
  return fs
    .readdirSync(runsDir)
    .filter((d) => fs.existsSync(path.join(runsDir, d, 'manifest.json')))
    .filter((d) => {
      const m = readManifest(d, worktree);
      return m.status === 'success' && m.level === 'full';
    })
    .sort()
    .reverse();
}

const runId = argRunId ?? listSuccessfulFullRuns()[0];
if (!runId) {
  console.error('No successful full run found under .perf-data/runs/');
  process.exit(1);
}

const runDir = path.join(runsDir, runId);
const summary = JSON.parse(
  fs.readFileSync(path.join(runDir, 'summary.json'), 'utf8'),
) as Record<string, unknown>;
const manifest = readManifest(runId, worktree);

if (
  !shouldPublishCompleteSnapshot({
    status: manifest.status,
    level: manifest.level,
    stages: manifest.stages,
    summary,
  })
) {
  console.error(`Run ${runId} is not a complete successful full audit.`);
  process.exit(1);
}

const host = getHostFingerprint(
  typeof summary.lighthouse === 'object' &&
    summary.lighthouse &&
    'benchmarkIndex' in summary.lighthouse
    ? (summary.lighthouse as { benchmarkIndex?: number }).benchmarkIndex
    : undefined,
);
const fp = fingerprintKey(host).replace(/\|/g, '_');
const msg = `audit: ${manifest.gitSha.slice(0, 7)} full ${fp} snapshot`;

appendPerfDataSnapshotCommit(worktree, runDir, msg);
console.log(`perf-data: merged dev and appended snapshot/latest from ${runId}`);

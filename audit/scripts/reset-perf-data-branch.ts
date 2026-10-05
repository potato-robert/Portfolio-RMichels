#!/usr/bin/env node
/**
 * One-time / manual: reset perf-data branch to dev + slim snapshot from the latest
 * successful full local run (or a given run id).
 */
import fs from 'node:fs';
import path from 'node:path';
import { getWorktreePath, readManifest } from '../lib/snapshot.ts';
import { publishLatestCompleteSnapshot } from '../lib/perf-data-publish.ts';
import { shouldPublishCompleteSnapshot } from '../lib/snapshot-substance.ts';

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

const msg = `audit: ${manifest.gitSha.slice(0, 7)} full snapshot (${runId})`;
publishLatestCompleteSnapshot(worktree, runDir, msg);
console.log(`perf-data branch reset to dev + snapshot/latest from ${runId}`);

#!/usr/bin/env node
/**
 * Regenerate summary.txt and summary.logSummary from manifest + summary.json.
 * Usage: node audit/scripts/refresh-run-log-summary.mjs [runId]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const worktree = path.join(root, '.perf-data');

const { formatAuditRunLogSummary } = await import(
  pathToFileURL(path.join(root, 'audit/lib/run-log-summary.ts')).href
);

function listRuns() {
  const runsDir = path.join(worktree, 'runs');
  return fs
    .readdirSync(runsDir)
    .filter((d) => fs.existsSync(path.join(runsDir, d, 'manifest.json')))
    .sort();
}

function refreshRunDir(runDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'manifest.json'), 'utf8'));
  const summaryPath = path.join(runDir, 'summary.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const logSummary = formatAuditRunLogSummary(manifest, summary);
  summary.logSummary = logSummary;
  fs.writeFileSync(path.join(runDir, 'summary.txt'), logSummary, 'utf8');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return logSummary;
}

const argRunId = process.argv[2];
const runId = argRunId ?? listRuns().at(-1);
if (!runId) {
  console.error('No runs found under .perf-data/runs/');
  process.exit(1);
}

const runDir = path.join(worktree, 'runs', runId);
if (!fs.existsSync(runDir)) {
  console.error(`Run not found: ${runDir}`);
  process.exit(1);
}

const logSummary = refreshRunDir(runDir);
console.error(`Updated ${runDir}`);

const snapshotDir = path.join(worktree, 'snapshot', 'latest');
if (fs.existsSync(path.join(snapshotDir, 'manifest.json'))) {
  const snapRunId = fs.readFileSync(path.join(snapshotDir, 'run-id.txt'), 'utf8').trim();
  if (snapRunId === runId) {
    refreshRunDir(snapshotDir);
    console.error(`Updated ${snapshotDir}`);
  }
}

process.stdout.write(logSummary);

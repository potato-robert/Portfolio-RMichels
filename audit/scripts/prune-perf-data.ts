#!/usr/bin/env node
/**
 * Remove empty local run folders under `.perf-data/runs/` and rebuild history.jsonl.
 * Does not modify the perf-data git branch (use audit publish on successful full runs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprintKey } from '../lib/host.ts';
import { getWorktreePath, readManifest, type AuditManifest } from '../lib/snapshot.ts';
import { isSubstantiveRunSnapshot } from '../lib/snapshot-substance.ts';

const worktree = getWorktreePath();
const runsDir = path.join(worktree, 'runs');

function countRawFiles(runDir: string): number {
  const raw = path.join(runDir, 'raw');
  if (!fs.existsSync(raw)) return 0;
  return fs.readdirSync(raw).filter((f) => fs.statSync(path.join(raw, f)).isFile()).length;
}

function readSummary(runDir: string): Record<string, unknown> {
  const p = path.join(runDir, 'summary.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, unknown>;
}

function listRunDirNames(): string[] {
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir).filter((d) => {
    const full = path.join(runsDir, d);
    return fs.statSync(full).isDirectory();
  });
}

function listRunIds(): string[] {
  return listRunDirNames().filter((d) => fs.existsSync(path.join(runsDir, d, 'manifest.json')));
}

function historyLine(m: AuditManifest): string {
  return JSON.stringify({
    runId: m.runId,
    createdAt: m.createdAt,
    completedAt: m.completedAt,
    status: m.status,
    gitSha: m.gitSha,
    level: m.level,
    target: m.target,
    hostKey: fingerprintKey(m.host),
    label: m.label,
    failureStage: m.failure?.stage,
  });
}

function rebuildHistory(runIds: string[]): void {
  const lines = runIds
    .map((id) => readManifest(id, worktree))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(historyLine);
  const out = path.join(worktree, 'history.jsonl');
  fs.writeFileSync(out, lines.length ? `${lines.join('\n')}\n` : '');
}

const dryRun = process.argv.includes('--dry-run');

const removed: string[] = [];
const kept: string[] = [];

for (const dirName of listRunDirNames()) {
  const runDir = path.join(runsDir, dirName);
  const manifestPath = path.join(runDir, 'manifest.json');
  const rawFileCount = countRawFiles(runDir);

  if (!fs.existsSync(manifestPath)) {
    if (rawFileCount > 0) {
      kept.push(`${dirName} (raw-only)`);
      continue;
    }
    removed.push(`${dirName} (no manifest)`);
    if (!dryRun) fs.rmSync(runDir, { recursive: true, force: true });
    continue;
  }

  const summary = readSummary(runDir);
  if (isSubstantiveRunSnapshot({ summary, rawFileCount })) {
    kept.push(dirName);
    continue;
  }
  removed.push(dirName);
  if (!dryRun) fs.rmSync(runDir, { recursive: true, force: true });
}

console.log(`Local perf-data prune: kept ${kept.length}, removed ${removed.length} empty run(s)`);
if (removed.length) {
  for (const id of removed) console.log(`  - ${id}`);
}

if (dryRun) {
  process.exit(0);
}

rebuildHistory(listRunIds());

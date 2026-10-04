#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getWorktreePath,
  listRuns,
  readManifest,
  readSummary,
} from './lib/snapshot.ts';
import { fingerprintKey } from './lib/host.ts';
import { REGRESSION_THRESHOLDS } from './config/budgets.ts';

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

interface LhEntry {
  page: string;
  preset: string;
  metrics: { lcp: number; fcp: number; tbt: number; cls: number };
}

function loadLighthouse(runId: string): LhEntry[] {
  const summary = readSummary(runId);
  const lh = summary.lighthouse as { pages?: LhEntry[] } | undefined;
  return lh?.pages ?? [];
}

function regress(
  label: string,
  before: number,
  after: number,
  pct: number,
  floor: number,
): string | null {
  const delta = after - before;
  if (delta <= 0) return null;
  const rel = before > 0 ? delta / before : delta;
  if (rel >= pct && delta >= floor) {
    return `${label}: ${before.toFixed(1)} → ${after.toFixed(1)} (+${delta.toFixed(1)})`;
  }
  return null;
}

export function compareRuns(runA: string, runB: string, worktree = getWorktreePath()): void {
  const manA = readManifest(runA, worktree);
  const manB = readManifest(runB, worktree);
  const keyA = fingerprintKey(manA.host);
  const keyB = fingerprintKey(manB.host);

  if (keyA !== keyB) {
    console.warn('Warning: host fingerprints differ — comparison may be noisy.');
  }
  if (manA.level !== manB.level) {
    console.warn(`Warning: levels differ (${manA.level} vs ${manB.level}).`);
  }

  console.log(`Compare ${runA} → ${runB}\n`);

  const lhA = loadLighthouse(runA);
  const lhB = loadLighthouse(runB);
  const mapB = new Map(lhB.map((e) => [`${e.page}|${e.preset}`, e]));

  const regressions: string[] = [];
  for (const a of lhA) {
    const b = mapB.get(`${a.page}|${a.preset}`);
    if (!b) continue;
    for (const msg of [
      regress('LCP', a.metrics.lcp, b.metrics.lcp, REGRESSION_THRESHOLDS.lcpMs.pct, REGRESSION_THRESHOLDS.lcpMs.floorMs),
      regress('FCP', a.metrics.fcp, b.metrics.fcp, REGRESSION_THRESHOLDS.fcpMs.pct, REGRESSION_THRESHOLDS.fcpMs.floorMs),
      regress('TBT', a.metrics.tbt, b.metrics.tbt, REGRESSION_THRESHOLDS.tbtMs.pct, REGRESSION_THRESHOLDS.tbtMs.floorMs),
      regress('CLS', a.metrics.cls, b.metrics.cls, REGRESSION_THRESHOLDS.cls.pct, REGRESSION_THRESHOLDS.cls.floor),
    ]) {
      if (msg) regressions.push(`${a.page} (${a.preset}): ${msg}`);
    }
  }

  if (regressions.length === 0) {
    console.log('No Lighthouse regressions above thresholds.');
  } else {
    console.log('Regressions:');
    for (const r of regressions) console.log(`  - ${r}`);
  }
}

function resolveDefaultRuns(worktree: string): [string, string] {
  const runs = listRuns(worktree);
  if (runs.length < 2) {
    throw new Error('Need at least two runs in .perf-data/runs/');
  }
  const latest = runs.at(-1)!;
  const man = readManifest(latest, worktree);
  const key = fingerprintKey(man.host);
  let prev: string | undefined;
  for (let i = runs.length - 2; i >= 0; i--) {
    const candidate = runs[i]!;
    const m = readManifest(candidate, worktree);
    if (fingerprintKey(m.host) === key) {
      prev = candidate;
      break;
    }
  }
  if (!prev) prev = runs.at(-2)!;
  return [prev, latest];
}

if (isDirectRun) {
  const worktree = getWorktreePath();
  const argA = process.argv[2];
  const argB = process.argv[3];
  const [runA, runB] = argA && argB ? [argA, argB] : resolveDefaultRuns(worktree);
  compareRuns(runA, runB, worktree);
}

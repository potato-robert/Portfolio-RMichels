#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getWorktreePath,
  listRuns,
  readManifest,
  readSummary,
} from './lib/snapshot.ts';
import { fingerprintKey } from './lib/host.ts';
import { INTERACTION_BUDGETS, REGRESSION_THRESHOLDS } from './config/budgets.ts';

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

interface LhEntry {
  page: string;
  preset: string;
  metrics: { lcp: number; fcp: number; tbt: number; cls: number };
  categories?: { performance: number; accessibility: number; bestPractices: number; seo: number };
  bytes?: { total: number; script: number; image: number; font: number; glb: number; other: number };
}

interface IxProfile {
  profileId: string;
  page: string;
  scenarios?: Array<{ scenario: string; metrics?: Record<string, number> }>;
  warning?: string;
}

function loadLighthouse(runId: string): LhEntry[] {
  const summary = readSummary(runId);
  const lh = summary.lighthouse as { pages?: LhEntry[] } | undefined;
  return lh?.pages ?? [];
}

function loadInteraction(runId: string): IxProfile[] {
  const summary = readSummary(runId);
  const ix = summary.interaction as { profiles?: IxProfile[] } | undefined;
  return ix?.profiles ?? [];
}

function loadSeoCount(runId: string): number {
  const summary = readSummary(runId);
  const seo = summary.seo as { findings?: unknown[] } | undefined;
  return seo?.findings?.length ?? 0;
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

function regressLowerIsBetter(
  label: string,
  before: number,
  after: number,
  pct: number,
  floor: number,
): string | null {
  return regress(label, before, after, pct, floor);
}

function regressHigherIsBetter(
  label: string,
  before: number,
  after: number,
  pct: number,
  floor: number,
): string | null {
  const delta = before - after;
  if (delta <= 0) return null;
  const rel = before > 0 ? delta / before : delta;
  if (rel >= pct && delta >= floor) {
    return `${label}: ${before.toFixed(1)} → ${after.toFixed(1)} (−${delta.toFixed(1)})`;
  }
  return null;
}

function scrollScenario(profile: IxProfile) {
  return profile.scenarios?.find((s) => s.scenario === 'scroll');
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

    if (a.categories && b.categories) {
      for (const [label, key] of [
        ['Perf score', 'performance'],
        ['A11y score', 'accessibility'],
        ['BP score', 'bestPractices'],
        ['SEO score', 'seo'],
      ] as const) {
        const msg = regressHigherIsBetter(
          label,
          a.categories[key],
          b.categories[key],
          REGRESSION_THRESHOLDS.categoryScore.pct,
          REGRESSION_THRESHOLDS.categoryScore.floor,
        );
        if (msg) regressions.push(`${a.page} (${a.preset}): ${msg}`);
      }
    }

    if (a.bytes && b.bytes) {
      for (const kind of ['total', 'script', 'image', 'font', 'glb'] as const) {
        const msg = regressLowerIsBetter(
          `${kind} bytes`,
          a.bytes[kind],
          b.bytes[kind],
          0.1,
          20_000,
        );
        if (msg) regressions.push(`${a.page} (${a.preset}): ${msg}`);
      }
    }
  }

  const ixA = loadInteraction(runA);
  const ixB = loadInteraction(runB);
  const ixMapB = new Map(ixB.map((p) => [`${p.profileId}|${p.page}`, p]));
  for (const rowA of ixA) {
    const rowB = ixMapB.get(`${rowA.profileId}|${rowA.page}`);
    if (!rowB) continue;
    const scrollA = scrollScenario(rowA)?.metrics;
    const scrollB = scrollScenario(rowB)?.metrics;
    if (scrollA?.p95 !== undefined && scrollB?.p95 !== undefined) {
      const msg = regress(
        'scroll p95',
        scrollA.p95,
        scrollB.p95,
        REGRESSION_THRESHOLDS.interactionP95Ms.pct,
        REGRESSION_THRESHOLDS.interactionP95Ms.floorMs,
      );
      if (msg) regressions.push(`${rowA.profileId} ${rowA.page}: ${msg}`);
    }
    if (scrollA?.effectiveFps !== undefined && scrollB?.effectiveFps !== undefined) {
      const msg = regressHigherIsBetter(
        'scroll FPS',
        scrollA.effectiveFps,
        scrollB.effectiveFps,
        REGRESSION_THRESHOLDS.scrollEffectiveFps.pct,
        REGRESSION_THRESHOLDS.scrollEffectiveFps.floor,
      );
      if (msg) regressions.push(`${rowA.profileId} ${rowA.page}: ${msg}`);
    }
    for (const clickId of ['click-menu', 'click-filter', 'click-lightbox'] as const) {
      const inpA = rowA.scenarios?.find((s) => s.scenario === clickId)?.metrics?.inpMs;
      const inpB = rowB.scenarios?.find((s) => s.scenario === clickId)?.metrics?.inpMs;
      if (inpA !== undefined && inpB !== undefined && inpA > 0 && inpB > 0) {
        const msg = regress(
          `${clickId} INP`,
          inpA,
          inpB,
          REGRESSION_THRESHOLDS.inpMs.pct,
          REGRESSION_THRESHOLDS.inpMs.floorMs,
        );
        if (msg) regressions.push(`${rowA.profileId} ${rowA.page}: ${msg}`);
      }
    }
    if (rowB.warning && !rowA.warning) {
      regressions.push(`${rowA.profileId} ${rowA.page}: tier warning appeared (${rowB.warning})`);
    }
  }

  const seoA = loadSeoCount(runA);
  const seoB = loadSeoCount(runB);
  const seoDelta = seoB - seoA;
  if (seoDelta >= REGRESSION_THRESHOLDS.seoFindingCount.floor && seoA > 0) {
    const rel = seoDelta / seoA;
    if (rel >= REGRESSION_THRESHOLDS.seoFindingCount.pct) {
      regressions.push(`SEO findings: ${seoA} → ${seoB} (+${seoDelta})`);
    }
  }

  if (regressions.length === 0) {
    console.log('No regressions above thresholds.');
  } else {
    console.log('Regressions:');
    for (const r of regressions) console.log(`  - ${r}`);
  }

  console.log('\nBudget hints (latest run scroll):');
  for (const row of ixB) {
    const scroll = scrollScenario(row)?.metrics;
    if (!scroll?.p95) continue;
    const flags: string[] = [];
    if (scroll.p95 > INTERACTION_BUDGETS.scrollP95Ms) flags.push(`p95>${INTERACTION_BUDGETS.scrollP95Ms}ms`);
    if ((scroll.effectiveFps ?? 0) < INTERACTION_BUDGETS.scrollEffectiveFpsMin) {
      flags.push(`FPS<${INTERACTION_BUDGETS.scrollEffectiveFpsMin}`);
    }
    if (flags.length) {
      console.log(`  - ${row.profileId} ${row.page}: ${flags.join(', ')}`);
    }
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

import type { AuditManifest } from './snapshot.ts';

type LhPage = {
  page: string;
  preset: string;
  runs: number;
  metrics: {
    lcp: number;
    fcp: number;
    tbt: number;
    cls: number;
    speedIndex?: number;
    tti?: number;
  };
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  benchmarkIndex?: number;
};

type IxProfile = {
  profileId: string;
  page: string;
  failed?: boolean;
  warning?: string;
  scenarios?: Array<{ scenario: string; metrics?: Record<string, number> }>;
};

/** ↑ = higher is better · ↓ = lower is better */
type Better = 'higher' | 'lower';

function m(label: string, better: Better): string {
  return `${label} (${better === 'higher' ? '↑' : '↓'})`;
}

function mean(nums: number[]): number | undefined {
  if (!nums.length) return undefined;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function fmtMs(n: number | undefined, digits = 0): string {
  if (n === undefined || Number.isNaN(n)) return '—';
  return `${n.toFixed(digits)}ms`;
}

function fmtScore(n: number | undefined, digits = 0): string {
  if (n === undefined || Number.isNaN(n)) return '—';
  return n.toFixed(digits);
}

function fmtCls(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return '—';
  return n.toFixed(3);
}

function durationHuman(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms < 0 || Number.isNaN(ms)) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}m ${rem}s` : `${min}m`;
}

function line(title: string): string {
  return title;
}

function section(title: string): string[] {
  return ['', title, '─'.repeat(Math.min(72, title.length + 4))];
}

function lighthouseBlock(summary: Record<string, unknown>): string[] {
  const lh = summary.lighthouse as { benchmarkIndex?: number; pages?: LhPage[] } | undefined;
  const pages = lh?.pages ?? [];
  if (!pages.length) return ['  (no Lighthouse data)'];

  const runs = pages[0]?.runs ?? 0;
  const out: string[] = [];
  const bench = lh?.benchmarkIndex ?? pages[0]?.benchmarkIndex;
  out.push(
    `  ${pages.length} page×preset medians (${runs} run${runs === 1 ? '' : 's'} each) · ${m('benchmark index', 'higher')} ${bench ?? '—'}`,
  );

  const avgPerf = mean(pages.map((p) => p.categories.performance));
  const avgA11y = mean(pages.map((p) => p.categories.accessibility));
  const avgBp = mean(pages.map((p) => p.categories.bestPractices));
  const avgSeo = mean(pages.map((p) => p.categories.seo));
  const avgLcp = mean(pages.map((p) => p.metrics.lcp));
  const avgFcp = mean(pages.map((p) => p.metrics.fcp));
  const avgTbt = mean(pages.map((p) => p.metrics.tbt));
  const avgCls = mean(pages.map((p) => p.metrics.cls));

  out.push(
    `  Scores (avg): ${m('Perf', 'higher')} ${fmtScore(avgPerf)} · ${m('A11y', 'higher')} ${fmtScore(avgA11y)} · ${m('BP', 'higher')} ${fmtScore(avgBp)} · ${m('SEO', 'higher')} ${fmtScore(avgSeo)}`,
  );
  out.push(
    `  Web vitals (avg): ${m('LCP', 'lower')} ${fmtMs(avgLcp)} · ${m('FCP', 'lower')} ${fmtMs(avgFcp)} · ${m('TBT', 'lower')} ${fmtMs(avgTbt)} · ${m('CLS', 'lower')} ${fmtCls(avgCls)}`,
  );

  const presets = [...new Set(pages.map((p) => p.preset))].sort();
  for (const preset of presets) {
    const subset = pages.filter((p) => p.preset === preset);
    out.push(
      `  ${preset}: ${m('LCP', 'lower')} ${fmtMs(mean(subset.map((p) => p.metrics.lcp)))} · ${m('Perf', 'higher')} ${fmtScore(mean(subset.map((p) => p.categories.performance)))} (${subset.length} pages)`,
    );
  }

  const slowest = [...pages].sort((a, b) => b.metrics.lcp - a.metrics.lcp).slice(0, 5);
  out.push(`  Slowest ${m('LCP', 'lower')}:`);
  for (const p of slowest) {
    out.push(
      `    ${p.page} (${p.preset}): ${m('LCP', 'lower')} ${fmtMs(p.metrics.lcp)} · ${m('Perf', 'higher')} ${fmtScore(p.categories.performance)} · ${m('SEO', 'higher')} ${fmtScore(p.categories.seo)}`,
    );
  }

  return out;
}

function interactionBlock(summary: Record<string, unknown>): string[] {
  const ix = summary.interaction as { profiles?: IxProfile[] } | undefined;
  const profiles = ix?.profiles ?? [];
  if (!profiles.length) return ['  (no interaction data)'];

  const cold = profiles
    .flatMap((p) => p.scenarios ?? [])
    .filter((s) => s.scenario === 'cold-load')
    .map((s) => s.metrics?.durationMs)
    .filter((n): n is number => typeof n === 'number');
  const warm = profiles
    .flatMap((p) => p.scenarios ?? [])
    .filter((s) => s.scenario === 'warm-load')
    .map((s) => s.metrics?.durationMs)
    .filter((n): n is number => typeof n === 'number');

  const scrollMetrics = profiles
    .map((p) => p.scenarios?.find((s) => s.scenario === 'scroll')?.metrics)
    .filter((m): m is Record<string, number> => !!m);

  const avgFps = mean(scrollMetrics.map((m) => m.effectiveFps).filter((n) => n !== undefined));
  const avgP95 = mean(scrollMetrics.map((m) => m.p95).filter((n) => n !== undefined));
  const avgDropped = mean(scrollMetrics.map((m) => m.droppedFramePct).filter((n) => n !== undefined));

  const inpValues = profiles
    .flatMap((p) => p.scenarios ?? [])
    .map((s) => s.metrics?.inpMs)
    .filter((n): n is number => typeof n === 'number' && n > 0);

  const hardFails = profiles.filter((p) => p.failed).length;
  const tierWarnings = profiles.filter((p) => p.warning).length;

  const out: string[] = [];
  out.push(`  ${profiles.length} profile×page runs`);
  out.push(
    `  Navigation (load event): ${m('cold avg', 'lower')} ${fmtMs(mean(cold))}${warm.length ? ` · ${m('warm avg', 'lower')} ${fmtMs(mean(warm))}` : ''}`,
  );
  if (scrollMetrics.length) {
    out.push(
      `  Scroll: ${m('avg FPS', 'higher')} ${avgFps !== undefined ? avgFps.toFixed(1) : '—'} · ${m('p95', 'lower')} ${avgP95 !== undefined ? `${avgP95.toFixed(1)}ms` : '—'} · ${m('dropped frames', 'lower')} ${avgDropped !== undefined ? `${avgDropped.toFixed(1)}%` : '—'}`,
    );
  }
  if (inpValues.length) {
    out.push(
      `  ${m('INP', 'lower')} (click scenarios): ${m('median', 'lower')} ${fmtMs(median(inpValues), 0)} · ${m('max', 'lower')} ${fmtMs(Math.max(...inpValues), 0)}`,
    );
  }
  out.push(
    `  ${m('Hard failures', 'lower')}: ${hardFails} · ${m('tier warnings', 'lower')}: ${tierWarnings}`,
  );

  return out;
}

function median(nums: number[]): number | undefined {
  if (!nums.length) return undefined;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function ciGateBlock(summary: Record<string, unknown>): string[] {
  const ci = summary.ciGate as
    | { passed?: boolean; commands?: Array<{ name: string; exitCode: number; durationMs: number }> }
    | undefined;
  if (!ci) return ['  (not run)'];
  const cmds = ci.commands ?? [];
  const status = ci.passed ? 'PASSED' : 'FAILED';
  const lines = [`  ${status}`];
  for (const c of cmds) {
    const ok = c.exitCode === 0 ? 'ok' : `exit ${c.exitCode}`;
    lines.push(`    ${c.name}: ${ok} (${Math.round(c.durationMs / 1000)}s)`);
  }
  return lines;
}

function seoBlock(summary: Record<string, unknown>): string[] {
  const seo = summary.seo as
    | {
        findings?: Array<{ severity: string }>;
        linkCheck?: { passed?: boolean; failures?: string[] };
      }
    | undefined;
  if (!seo) return ['  (not run)'];
  const findings = seo.findings ?? [];
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const out = [
    `  ${m('Errors', 'lower')}: ${errors} · ${m('warnings', 'lower')}: ${warnings}`,
  ];
  if (seo.linkCheck) {
    const broken = seo.linkCheck.failures?.length ?? 0;
    const lc = seo.linkCheck.passed ? 'passed' : `failed · ${m('broken links', 'lower')} ${broken}`;
    out.push(`  Link crawl: ${lc}`);
  }
  return out;
}

/** Plain-text audit summary for terminal output and `summary.json` / snapshot. */
export function formatAuditRunLogSummary(
  manifest: AuditManifest,
  summary: Record<string, unknown>,
): string {
  const failure = summary.failure as { stage?: string; message?: string } | undefined;
  const completedAt = manifest.completedAt ?? new Date().toISOString();
  const duration = durationHuman(manifest.createdAt, completedAt);

  const header = [
    '═'.repeat(72),
    ' AUDIT RUN SUMMARY',
    '═'.repeat(72),
    line(`Run:      ${manifest.runId}`),
    line(`Status:   ${manifest.status ?? 'unknown'} · ${manifest.level} · ${manifest.target}`),
    line(
      `Git:      ${manifest.gitSha.slice(0, 7)} (${manifest.gitBranch})${manifest.dirty ? ' · dirty working tree' : ''}`,
    ),
    line(`Duration: ${duration} · completed ${completedAt}`),
    line(`Stages:   ${manifest.stages.join(', ')}`),
    line('Metrics:  (↑) higher is better · (↓) lower is better'),
  ];

  if (failure?.message) {
    header.push(line(`Failure:  [${failure.stage ?? 'unknown'}] ${failure.message}`));
  }

  const body: string[] = [...header];

  body.push(...section('CI GATE'), ...ciGateBlock(summary));

  const docker = summary.dockerSmoke as { passed?: boolean; profileId?: string } | undefined;
  if (docker) {
    body.push(
      ...section('DOCKER SMOKE'),
      `  ${docker.passed ? 'PASSED' : 'FAILED'}${docker.profileId ? ` (${docker.profileId})` : ''}`,
    );
  }

  body.push(...section('LIGHTHOUSE'), ...lighthouseBlock(summary));
  body.push(...section('INTERACTION'), ...interactionBlock(summary));
  body.push(...section('SEO'), ...seoBlock(summary));

  body.push('', '═'.repeat(72));
  body.push(`Artifacts: summary.json · summary.txt · report.html`);
  body.push('═'.repeat(72));

  return `${body.join('\n')}\n`;
}

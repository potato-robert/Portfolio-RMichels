#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuditManifest } from './lib/snapshot.ts';
import { getWorktreePath, listRuns, readManifest, readSummary } from './lib/snapshot.ts';

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type LhPage = {
  page: string;
  preset: string;
  metrics: { lcp: number; fcp: number; tbt: number; cls: number };
  categories: { performance: number; accessibility: number; bestPractices: number; seo: number };
  benchmarkIndex?: number;
  lcpElement?: { selector?: string; nodeLabel?: string };
  opportunities?: {
    renderBlocking?: Array<{ url: string; wastedMs: number }>;
    unusedJavascript?: { wastedBytes: number };
  };
  failedAudits?: { seo: string[]; accessibility: string[]; bestPractices: string[] };
};

type IxProfile = {
  profileId: string;
  page: string;
  warning?: string;
  scenarios?: Array<{ scenario: string; metrics?: Record<string, number> }>;
};

function lighthouseTable(pages: LhPage[]): string {
  if (!pages.length) return '<p>No Lighthouse data.</p>';
  const rows = pages
    .map((p) => {
      const lcpEl = p.lcpElement?.selector ?? p.lcpElement?.nodeLabel ?? '—';
      const rb = p.opportunities?.renderBlocking?.[0];
      const opp = rb
        ? `${escapeHtml(rb.url.slice(0, 60))} (+${Math.round(rb.wastedMs)}ms)`
        : p.opportunities?.unusedJavascript
          ? `unused JS ~${Math.round(p.opportunities.unusedJavascript.wastedBytes / 1024)}KB`
          : '—';
      const failed = [
        ...(p.failedAudits?.seo ?? []),
        ...(p.failedAudits?.accessibility ?? []),
      ].slice(0, 3);
      return `<tr>
        <td>${escapeHtml(p.page)}</td>
        <td>${escapeHtml(p.preset)}</td>
        <td>${p.categories.performance}</td>
        <td>${p.categories.seo}</td>
        <td>${Math.round(p.metrics.lcp)}</td>
        <td>${escapeHtml(lcpEl)}</td>
        <td>${opp}</td>
        <td>${escapeHtml(failed.join(', ') || '—')}</td>
        <td>${p.benchmarkIndex ?? '—'}</td>
      </tr>`;
    })
    .join('');
  return `<table><thead><tr>
    <th>Page</th><th>Preset</th><th>Perf</th><th>SEO</th><th>LCP ms</th><th>LCP element</th><th>Top opportunity</th><th>Failed audits</th><th>Benchmark</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

function scrollFpsGrid(profiles: IxProfile[]): string {
  const scrollRows = profiles
    .map((p) => {
      const scroll = p.scenarios?.find((s) => s.scenario === 'scroll')?.metrics;
      if (!scroll) return '';
      return `<tr>
        <td>${escapeHtml(p.profileId)}</td>
        <td>${escapeHtml(p.page)}</td>
        <td>${scroll.effectiveFps?.toFixed(1) ?? '—'}</td>
        <td>${scroll.droppedFramePct?.toFixed(1) ?? '—'}%</td>
        <td>${scroll.p95?.toFixed(1) ?? '—'}</td>
        <td>${scroll.p99?.toFixed(1) ?? '—'}</td>
        <td>${scroll.inpMs ?? '—'}</td>
        <td>${p.warning ? escapeHtml(p.warning) : '—'}</td>
      </tr>`;
    })
    .filter(Boolean)
    .join('');
  if (!scrollRows) return '<p>No interaction scroll data.</p>';
  return `<table><thead><tr>
    <th>Profile</th><th>Page</th><th>FPS</th><th>Dropped %</th><th>p95 ms</th><th>p99 ms</th><th>INP</th><th>Tier</th>
  </tr></thead><tbody>${scrollRows}</tbody></table>`;
}

export function generateRunReportHtml(
  manifest: AuditManifest,
  summary: Record<string, unknown>,
): string {
  const failure = summary.failure as { stage?: string; message?: string } | undefined;
  const preflight = summary.preflight as {
    passed?: boolean;
    checks?: Array<{ name: string; ok: boolean; detail: string }>;
  } | undefined;
  const seo = summary.seo as { findings?: Array<{ severity: string; page: string; rule: string; detail: string }> } | undefined;
  const lhPages = (summary.lighthouse as { pages?: LhPage[] } | undefined)?.pages ?? [];
  const ixProfiles = (summary.interaction as { profiles?: IxProfile[] } | undefined)?.profiles ?? [];
  const dockerSmoke = summary.dockerSmoke as
    | { passed?: boolean; profileId?: string; pagePath?: string; exitCode?: number; stderr?: string }
    | undefined;

  const preflightRows =
    preflight?.checks
      ?.map(
        (c) =>
          `<tr><td>${escapeHtml(c.name)}</td><td>${c.ok ? 'ok' : 'FAIL'}</td><td><pre style="margin:0;white-space:pre-wrap">${escapeHtml(c.detail)}</pre></td></tr>`,
      )
      .join('') ?? '';

  const seoRows =
    seo?.findings
      ?.map(
        (f) =>
          `<tr><td>${escapeHtml(f.severity)}</td><td>${escapeHtml(f.page)}</td><td>${escapeHtml(f.rule)}</td><td>${escapeHtml(f.detail)}</td></tr>`,
      )
      .join('') ?? '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Audit ${escapeHtml(manifest.runId)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ccc; padding: 0.35rem 0.5rem; text-align: left; font-size: 0.9rem; }
    th { background: #f4f4f4; }
    pre { background: #f8f8f8; padding: 1rem; overflow: auto; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>Audit report</h1>
  <p><strong>Run:</strong> ${escapeHtml(manifest.runId)}</p>
  <p><strong>Git:</strong> ${escapeHtml(manifest.gitSha.slice(0, 7))} (${escapeHtml(manifest.gitBranch)})${manifest.dirty ? ' dirty' : ''}</p>
  <p><strong>Level:</strong> ${manifest.level} · <strong>Target:</strong> ${manifest.target}</p>
  <p><strong>Status:</strong> ${escapeHtml(manifest.status ?? 'unknown')}${manifest.completedAt ? ` · completed ${escapeHtml(manifest.completedAt)}` : ''}</p>
  ${
    failure?.message
      ? `<section style="background:#fee;padding:1rem;border:1px solid #c00;margin:1rem 0"><h2>Failure</h2><p><strong>Stage:</strong> ${escapeHtml(failure.stage ?? manifest.failure?.stage ?? 'unknown')}</p><pre>${escapeHtml(failure.message)}</pre></section>`
      : ''
  }
  <h2>Preflight</h2>
  <table><thead><tr><th>Check</th><th>Result</th><th>Detail</th></tr></thead><tbody>${preflightRows}</tbody></table>
  ${
    dockerSmoke
      ? `<h2>Docker smoke</h2><p><strong>${dockerSmoke.passed ? 'ok' : 'FAIL'}</strong> · ${escapeHtml(dockerSmoke.profileId ?? '')} ${escapeHtml(dockerSmoke.pagePath ?? '')} (exit ${dockerSmoke.exitCode ?? '?'})</p>${
          dockerSmoke.stderr ? `<pre>${escapeHtml(dockerSmoke.stderr)}</pre>` : ''
        }`
      : ''
  }
  <h2>Lighthouse</h2>
  ${lighthouseTable(lhPages)}
  <h2>Scroll performance (interaction)</h2>
  ${scrollFpsGrid(ixProfiles)}
  <h2>SEO findings</h2>
  <table><thead><tr><th>Severity</th><th>Page</th><th>Rule</th><th>Detail</th></tr></thead><tbody>${seoRows}</tbody></table>
</body>
</html>`;
}

function svgSparkline(values: number[], width = 120, height = 32): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline fill="none" stroke="#0366d6" stroke-width="1.5" points="${points}"/></svg>`;
}

function buildTrendDashboard(worktree: string): string {
  const historyPath = path.join(worktree, 'history.jsonl');
  const lines = fs.existsSync(historyPath)
    ? fs.readFileSync(historyPath, 'utf8').trim().split('\n').filter(Boolean)
    : [];
  const entries = lines.map((l) => JSON.parse(l) as Record<string, unknown>);

  const hostKey = entries.length ? String(entries.at(-1)!.hostKey ?? '') : '';
  const sameHost = entries.filter((e) => String(e.hostKey ?? '') === hostKey);

  const lcpSeries: number[] = [];
  const seoSeries: number[] = [];
  for (const entry of sameHost) {
    const runId = String(entry.runId ?? '');
    if (!runId) continue;
    try {
      const summary = readSummary(runId, worktree);
      const lh = summary.lighthouse as { pages?: LhPage[] } | undefined;
      const homeMobile = lh?.pages?.find((p) => p.page === '/' && p.preset === 'mobile');
      if (homeMobile) lcpSeries.push(homeMobile.metrics.lcp);
      const seo = summary.seo as { findings?: unknown[] } | undefined;
      seoSeries.push(seo?.findings?.length ?? 0);
    } catch {
      // skip broken runs
    }
  }

  const runCards = listRuns(worktree)
    .map((id) => {
      const m = readManifest(id, worktree);
      return `<li><a href="runs/${id}/report.html">${escapeHtml(id)}</a> — ${m.level} ${m.target} ${m.createdAt.slice(0, 10)}</li>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Audit history</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; }
    .metric { margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>Portfolio audit trends</h1>
  <p>Local dashboard from <code>.perf-data/history.jsonl</code> (${entries.length} runs, fingerprint <code>${escapeHtml(hostKey)}</code>).</p>
  <div class="metric"><strong>Home mobile LCP (ms)</strong> ${svgSparkline(lcpSeries)} <span>${lcpSeries.at(-1) ? Math.round(lcpSeries.at(-1)!) : '—'}</span></div>
  <div class="metric"><strong>SEO finding count</strong> ${svgSparkline(seoSeries)} <span>${seoSeries.at(-1) ?? '—'}</span></div>
  <h2>Runs</h2>
  <ul>${runCards || '<li>No runs yet</li>'}</ul>
</body>
</html>`;
}

if (isDirectRun) {
  const worktree = getWorktreePath();
  const out = path.join(worktree, 'index.html');
  fs.mkdirSync(worktree, { recursive: true });
  fs.writeFileSync(out, buildTrendDashboard(worktree));
  console.log(`Wrote ${out}`);
}

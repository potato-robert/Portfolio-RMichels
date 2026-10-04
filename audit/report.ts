#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuditManifest } from './lib/snapshot.ts';
import { getWorktreePath, listRuns, readManifest, readSummary } from './lib/snapshot.ts';

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

export function generateRunReportHtml(
  manifest: AuditManifest,
  summary: Record<string, unknown>,
): string {
  const failure = summary.failure as { stage?: string; message?: string } | undefined;
  const preflight = summary.preflight as {
    passed?: boolean;
    checks?: Array<{ name: string; ok: boolean; detail: string }>;
    playwright?: { installCommand?: string };
  } | undefined;
  const seo = summary.seo as { findings?: Array<{ severity: string; page: string; rule: string; detail: string }> } | undefined;
  const lh = summary.lighthouse as { pages?: unknown[] } | undefined;
  const ix = summary.interaction as { profiles?: unknown[] } | undefined;

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
    preflight?.playwright?.installCommand
      ? `<p>Playwright install: <code>${escapeHtml(preflight.playwright.installCommand)}</code></p>`
      : ''
  }
  <h2>Lighthouse pages</h2>
  <pre>${escapeHtml(JSON.stringify(lh?.pages ?? [], null, 2))}</pre>
  <h2>SEO findings</h2>
  <table><thead><tr><th>Severity</th><th>Page</th><th>Rule</th><th>Detail</th></tr></thead><tbody>${seoRows}</tbody></table>
  <h2>Interaction</h2>
  <pre>${escapeHtml(JSON.stringify(ix?.profiles ?? [], null, 2))}</pre>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTrendDashboard(worktree: string): string {
  const historyPath = path.join(worktree, 'history.jsonl');
  const lines = fs.existsSync(historyPath)
    ? fs.readFileSync(historyPath, 'utf8').trim().split('\n').filter(Boolean)
    : [];
  const entries = lines.map((l) => JSON.parse(l) as Record<string, unknown>);

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
    pre { background: #f4f4f4; padding: 1rem; overflow: auto; }
  </style>
</head>
<body>
  <h1>Portfolio audit trends</h1>
  <p>Local dashboard from <code>.perf-data/history.jsonl</code> (${entries.length} runs).</p>
  <h2>Runs</h2>
  <ul>${runCards || '<li>No runs yet</li>'}</ul>
  <h2>History (raw)</h2>
  <pre>${escapeHtml(JSON.stringify(entries, null, 2))}</pre>
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

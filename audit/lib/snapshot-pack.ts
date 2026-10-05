import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { LighthousePageMedian } from '../stages/lighthouse.ts';

const STAGE_FILES = [
  ['preflight', 'preflight'],
  ['ci-gate', 'ciGate'],
  ['docker-smoke', 'dockerSmoke'],
  ['lighthouse', 'lighthouse'],
  ['seo', 'seo'],
  ['interaction', 'interaction'],
] as const;

export function lighthouseRawBasename(pagePath: string, preset: string, runIndex: number): string {
  const prefix = pagePath.replace(/\//g, '_') || 'home';
  return `${prefix}_${preset}_${runIndex}.json.gz`;
}

export function medianRunIndex(runs: number): number {
  return Math.max(0, Math.floor((runs - 1) / 2));
}

/** Slim LHR JSON for git (metrics, categories, opportunities; no full network table). */
export function trimLhrForSnapshot(lhr: Record<string, unknown>): Record<string, unknown> {
  const audits = (lhr.audits ?? {}) as Record<
    string,
    {
      id?: string;
      title?: string;
      description?: string;
      score?: number | null;
      numericValue?: number;
      displayValue?: string;
      details?: { type?: string; items?: unknown[]; overallSavingsMs?: number; overallSavingsBytes?: number };
    }
  >;

  const slimAudits: Record<string, unknown> = {};
  for (const [id, audit] of Object.entries(audits)) {
    const keepDetails =
      audit.details?.type === 'opportunity' ||
      audit.details?.type === 'table' ||
      audit.details?.type === 'debugdata';
    slimAudits[id] = {
      id: audit.id ?? id,
      title: audit.title,
      score: audit.score,
      numericValue: audit.numericValue,
      displayValue: audit.displayValue,
      ...(keepDetails && audit.details ? { details: audit.details } : {}),
    };
  }

  return {
    requestedUrl: lhr.requestedUrl,
    finalUrl: lhr.finalUrl,
    fetchTime: lhr.fetchTime,
    lighthouseVersion: lhr.lighthouseVersion,
    environment: lhr.environment,
    categories: lhr.categories,
    audits: slimAudits,
  };
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function trimCiGate(ciGate: unknown): unknown {
  if (!ciGate || typeof ciGate !== 'object') return ciGate;
  const cg = ciGate as { commands?: Array<{ name?: string; ok?: boolean; outputTail?: string }>; passed?: boolean };
  return {
    passed: cg.passed,
    commands: (cg.commands ?? []).map((c) => ({
      name: c.name,
      ok: c.ok,
      outputTail: c.outputTail ? c.outputTail.slice(-4000) : undefined,
    })),
  };
}

function groupInteractionByProfile(interaction: unknown): Record<string, unknown> | undefined {
  if (!interaction || typeof interaction !== 'object') return undefined;
  const profiles = (interaction as { profiles?: Array<{ profileId: string }> }).profiles;
  if (!profiles?.length) return undefined;
  const byProfile: Record<string, unknown[]> = {};
  for (const row of profiles) {
    if (!byProfile[row.profileId]) byProfile[row.profileId] = [];
    byProfile[row.profileId].push(row);
  }
  return byProfile;
}

function buildLocalRawIndex(runDir: string, runId: string): Record<string, unknown> {
  const rawDir = path.join(runDir, 'raw');
  if (!fs.existsSync(rawDir)) {
    return { runId, rawFileCount: 0, totalBytes: 0, note: 'No raw/ directory' };
  }
  const files = fs.readdirSync(rawDir).filter((f) => fs.statSync(path.join(rawDir, f)).isFile());
  const totalBytes = files.reduce((sum, f) => sum + fs.statSync(path.join(rawDir, f)).size, 0);
  return {
    runId,
    rawFileCount: files.length,
    totalBytes,
    localPath: `runs/${runId}/raw/`,
    note: 'Full gzipped Lighthouse runs stay local only; committed snapshot uses stages/ + lighthouse/median-lhr/.',
  };
}

function writeMedianLhrFiles(
  runDir: string,
  destDir: string,
  lighthouse: { pages?: LighthousePageMedian[] } | undefined,
): number {
  const rawDir = path.join(runDir, 'raw');
  const pages = lighthouse?.pages ?? [];
  let written = 0;
  const outDir = path.join(destDir, 'lighthouse', 'median-lhr');
  for (const page of pages) {
    const runIndex = medianRunIndex(page.runs);
    const gzName = lighthouseRawBasename(page.page, page.preset, runIndex);
    const gzPath = path.join(rawDir, gzName);
    if (!fs.existsSync(gzPath)) continue;
    const body = JSON.parse(gunzipSync(fs.readFileSync(gzPath)).toString()) as Record<string, unknown>;
    const safeName = `${page.page.replace(/\//g, '_') || 'home'}_${page.preset}.json`;
    writeJson(path.join(outDir, safeName), trimLhrForSnapshot(body));
    written++;
  }
  return written;
}

const SNAPSHOT_README = `# Audit snapshot (committed)

This folder is the slim **git snapshot** for the latest successful full audit.

| Path | Contents |
|------|----------|
| \`summary.json\` | Full aggregated audit summary (same as local run) |
| \`stages/*.json\` | Per-stage JSON for review and diffs |
| \`lighthouse/median-lhr/*.json\` | One trimmed Lighthouse report per page × preset (median run) |
| \`interaction/by-profile/*.json\` | Interaction matrix grouped by profile |
| \`meta/local-raw-index.json\` | Pointer to full gzipped \`raw/\` on disk only |
| \`report.html\` | Human-readable run report |

Full Lighthouse \`raw/*.json.gz\` (all runs) remain under \`.perf-data/runs/<run-id>/raw/\` and are not committed.
`;

/**
 * Populate snapshot/latest with summary, split stages, median LHR extracts, and metadata.
 */
export function buildCommittedSnapshot(runDir: string, destDir: string): { filesWritten: number } {
  fs.mkdirSync(destDir, { recursive: true });

  const summary = JSON.parse(
    fs.readFileSync(path.join(runDir, 'summary.json'), 'utf8'),
  ) as Record<string, unknown>;
  const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'manifest.json'), 'utf8')) as {
    runId: string;
  };

  fs.copyFileSync(path.join(runDir, 'manifest.json'), path.join(destDir, 'manifest.json'));
  fs.copyFileSync(path.join(runDir, 'report.html'), path.join(destDir, 'report.html'));
  fs.writeFileSync(path.join(destDir, 'run-id.txt'), `${manifest.runId}\n`, 'utf8');
  fs.writeFileSync(path.join(destDir, 'README.md'), SNAPSHOT_README);

  writeJson(path.join(destDir, 'summary.json'), summary);

  let filesWritten = 5;

  for (const [fileSlug, summaryKey] of STAGE_FILES) {
    const chunk = summary[summaryKey];
    if (chunk == null) continue;
    const payload = summaryKey === 'ciGate' ? trimCiGate(chunk) : chunk;
    writeJson(path.join(destDir, 'stages', `${fileSlug}.json`), payload);
    filesWritten++;
  }

  const lhPages = (summary.lighthouse as { pages?: LighthousePageMedian[] } | undefined)?.pages;
  if (lhPages?.length) {
    writeJson(path.join(destDir, 'lighthouse', 'page-medians.json'), {
      benchmarkIndex: (summary.lighthouse as { benchmarkIndex?: number }).benchmarkIndex,
      pages: lhPages,
    });
    filesWritten++;
  }

  filesWritten += writeMedianLhrFiles(runDir, destDir, summary.lighthouse as { pages?: LighthousePageMedian[] });

  const byProfile = groupInteractionByProfile(summary.interaction);
  if (byProfile) {
    for (const [profileId, rows] of Object.entries(byProfile)) {
      const safe = profileId.replace(/[^\w.-]+/g, '_');
      writeJson(path.join(destDir, 'interaction', 'by-profile', `${safe}.json`), rows);
      filesWritten++;
    }
  }

  writeJson(path.join(destDir, 'meta', 'local-raw-index.json'), buildLocalRawIndex(runDir, manifest.runId));
  filesWritten++;

  return { filesWritten };
}

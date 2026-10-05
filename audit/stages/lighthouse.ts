import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import mobileConfig from 'lighthouse/core/config/lr-mobile-config.js';
import * as chromeLauncher from 'chrome-launcher';
import type { AuditPage } from '../config/pages.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';

export type LighthousePreset = 'mobile' | 'desktop' | 'mobile-lowend';

const mobileLowendConfig = {
  extends: 'lighthouse:default',
  settings: {
    ...mobileConfig.settings,
    formFactor: 'mobile' as const,
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 6,
      requestLatencyMs: 562.5,
      downloadThroughputKbps: 1474.56,
      uploadThroughputKbps: 675,
    },
    throttlingMethod: 'simulate' as const,
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
  },
};

export interface LcpPhaseBreakdown {
  timeToFirstByte?: number;
  resourceLoadDelay?: number;
  resourceLoadDuration?: number;
  elementRenderDelay?: number;
}

export interface LighthouseOpportunitySummary {
  renderBlocking?: Array<{ url: string; wastedMs: number }>;
  imageAudits?: {
    modernImageFormats?: { wastedBytes: number };
    usesResponsiveImages?: { wastedBytes: number };
    usesOptimizedImages?: { wastedBytes: number };
    offscreenImages?: { wastedBytes: number };
  };
  unusedJavascript?: { wastedBytes: number; wastedMs?: number };
  bootupTimeMs?: number;
  mainthreadWorkMs?: number;
  topRequestsBySize?: Array<{ url: string; transferSize: number }>;
}

export interface LighthousePageMedian {
  page: string;
  preset: LighthousePreset;
  runs: number;
  metrics: {
    lcp: number;
    fcp: number;
    tbt: number;
    cls: number;
    speedIndex: number;
    tti: number;
  };
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  bytes: {
    total: number;
    script: number;
    image: number;
    font: number;
    glb: number;
    other: number;
  };
  benchmarkIndex: number;
  lcpElement?: { selector?: string; nodeLabel?: string; url?: string };
  lcpPhases?: LcpPhaseBreakdown;
  opportunities?: LighthouseOpportunitySummary;
  failedAudits?: {
    seo: string[];
    accessibility: string[];
    bestPractices: string[];
  };
}

export interface LighthouseStageResult {
  benchmarkIndex: number;
  pages: LighthousePageMedian[];
}

type AuditRecord = Record<
  string,
  {
    score?: number | null;
    numericValue?: number;
    displayValue?: string;
    details?: {
      type?: string;
      items?: Array<Record<string, unknown>>;
      headings?: Array<{ key?: string }>;
    };
  }
>;

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function configForPreset(preset: LighthousePreset) {
  if (preset === 'desktop') return desktopConfig;
  if (preset === 'mobile-lowend') return mobileLowendConfig;
  return mobileConfig;
}

function sumResourceBytes(audits: AuditRecord): {
  script: number;
  image: number;
  font: number;
  glb: number;
  other: number;
  total: number;
} {
  const items = (audits['network-requests']?.details?.items ?? []) as Array<{
    transferSize?: number;
    url?: string;
    mimeType?: string;
  }>;
  let script = 0;
  let image = 0;
  let font = 0;
  let glb = 0;
  let other = 0;
  let total = 0;

  for (const item of items) {
    const size = item.transferSize ?? 0;
    total += size;
    const url = item.url ?? '';
    const mime = item.mimeType ?? '';
    if (url.endsWith('.glb') || mime.includes('model/gltf')) glb += size;
    else if (mime.includes('javascript') || url.endsWith('.js')) script += size;
    else if (mime.includes('image')) image += size;
    else if (mime.includes('font')) font += size;
    else other += size;
  }

  return { script, image, font, glb, other, total };
}

function failedAuditIds(lhr: Record<string, unknown>, categoryId: string): string[] {
  const categories = lhr.categories as Record<
    string,
    { auditRefs?: Array<{ id: string; weight?: number }> }
  >;
  const audits = (lhr.audits ?? {}) as AuditRecord;
  const refs = categories[categoryId]?.auditRefs ?? [];
  return refs
    .filter((ref) => {
      const score = audits[ref.id]?.score;
      return score !== null && score !== undefined && score < 1;
    })
    .map((ref) => ref.id);
}

function opportunityItems(
  audits: AuditRecord,
  id: string,
): Array<{ url: string; wastedMs: number }> {
  const items = audits[id]?.details?.items ?? [];
  return items
    .map((item) => ({
      url: String(item.url ?? item.source ?? ''),
      wastedMs: Number(item.wastedMs ?? item.total ?? 0),
    }))
    .filter((row) => row.url)
    .slice(0, 10);
}

function opportunityBytes(audits: AuditRecord, id: string): { wastedBytes: number } | undefined {
  const audit = audits[id];
  if (!audit || audit.score === 1) return undefined;
  const items = audit.details?.items ?? [];
  let wastedBytes = 0;
  for (const item of items) {
    wastedBytes += Number(item.wastedBytes ?? item.totalBytes ?? 0);
  }
  if (!wastedBytes && audit.numericValue) wastedBytes = audit.numericValue;
  return wastedBytes > 0 ? { wastedBytes: Math.round(wastedBytes) } : undefined;
}

function extractLcpDetails(audits: AuditRecord) {
  const lcpEl = audits['largest-contentful-paint-element']?.details?.items?.[0] as
    | { node?: { selector?: string; nodeLabel?: string }; url?: string }
    | undefined;
  const phases: LcpPhaseBreakdown = {};
  const breakdownItems = audits['lcp-breakdown-insight']?.details?.items ?? [];
  for (const item of breakdownItems) {
    const sub = String(item.subpart ?? '');
    const duration = Number(item.duration ?? 0);
    if (sub === 'timeToFirstByte') phases.timeToFirstByte = duration;
    else if (sub === 'resourceLoadDelay') phases.resourceLoadDelay = duration;
    else if (sub === 'resourceLoadDuration') phases.resourceLoadDuration = duration;
    else if (sub === 'elementRenderDelay') phases.elementRenderDelay = duration;
  }
  return {
    lcpElement: lcpEl
      ? {
          selector: lcpEl.node?.selector,
          nodeLabel: lcpEl.node?.nodeLabel,
          url: lcpEl.url,
        }
      : undefined,
    lcpPhases: Object.keys(phases).length ? phases : undefined,
  };
}

function extractOpportunities(audits: AuditRecord): LighthouseOpportunitySummary {
  const networkItems = (audits['network-requests']?.details?.items ?? []) as Array<{
    url?: string;
    transferSize?: number;
  }>;
  const topRequestsBySize = [...networkItems]
    .filter((i) => i.url && (i.transferSize ?? 0) > 0)
    .sort((a, b) => (b.transferSize ?? 0) - (a.transferSize ?? 0))
    .slice(0, 10)
    .map((i) => ({ url: i.url!, transferSize: i.transferSize ?? 0 }));

  const unusedJs = audits['unused-javascript'];
  const bootup = audits['bootup-time'];
  const mainthread = audits['mainthread-work-breakdown'];

  return {
    renderBlocking: opportunityItems(audits, 'render-blocking-resources'),
    imageAudits: {
      modernImageFormats: opportunityBytes(audits, 'modern-image-formats'),
      usesResponsiveImages: opportunityBytes(audits, 'uses-responsive-images'),
      usesOptimizedImages: opportunityBytes(audits, 'uses-optimized-images'),
      offscreenImages: opportunityBytes(audits, 'offscreen-images'),
    },
    unusedJavascript: unusedJs
      ? {
          wastedBytes: Math.round(
            Number(unusedJs.details?.items?.[0]?.wastedBytes ?? unusedJs.numericValue ?? 0),
          ),
          wastedMs: Number(unusedJs.details?.items?.[0]?.wastedMs ?? 0) || undefined,
        }
      : undefined,
    bootupTimeMs: bootup?.numericValue,
    mainthreadWorkMs: mainthread?.numericValue,
    topRequestsBySize,
  };
}

async function runOnce(
  url: string,
  preset: LighthousePreset,
): Promise<{ lhr: Record<string, unknown>; benchmarkIndex: number }> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  try {
    const config = configForPreset(preset);
    const runnerResult = await lighthouse(
      url,
      {
        logLevel: 'error',
        output: 'json',
        port: chrome.port,
        throttlingMethod: 'simulate',
      },
      config,
    );
    if (!runnerResult?.lhr) throw new Error('Lighthouse returned no report');
    const benchmarkIndex =
      (runnerResult.lhr.environment?.benchmarkIndex as number | undefined) ?? 0;
    return { lhr: runnerResult.lhr as unknown as Record<string, unknown>, benchmarkIndex };
  } finally {
    await chrome.kill();
  }
}

function extractMetrics(lhr: Record<string, unknown>) {
  const a = (lhr.audits ?? {}) as AuditRecord;
  const categories = (lhr.categories ?? {}) as Record<string, { score?: number }>;
  const num = (id: string) => a[id]?.numericValue ?? 0;
  const cat = (id: string) => Math.round((categories[id]?.score ?? 0) * 100);
  const lcpDetails = extractLcpDetails(a);
  return {
    metrics: {
      lcp: num('largest-contentful-paint'),
      fcp: num('first-contentful-paint'),
      tbt: num('total-blocking-time'),
      cls: num('cumulative-layout-shift'),
      speedIndex: num('speed-index'),
      tti: num('interactive'),
    },
    categories: {
      performance: cat('performance'),
      accessibility: cat('accessibility'),
      bestPractices: cat('best-practices'),
      seo: cat('seo'),
    },
    bytes: sumResourceBytes(a),
    ...lcpDetails,
    opportunities: extractOpportunities(a),
    failedAudits: {
      seo: failedAuditIds(lhr, 'seo'),
      accessibility: failedAuditIds(lhr, 'accessibility'),
      bestPractices: failedAuditIds(lhr, 'best-practices'),
    },
  };
}

export async function runLighthouseStage(options: {
  baseUrl: string;
  pages: AuditPage[];
  runs: number;
  rawDir: string;
  includeMobileLowend?: boolean;
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): Promise<LighthouseStageResult & { aborted?: boolean }> {
  const { baseUrl, pages, runs, rawDir, signal } = options;
  const presets: LighthousePreset[] = ['mobile', 'desktop'];
  if (options.includeMobileLowend) presets.push('mobile-lowend');
  const results: LighthousePageMedian[] = [];
  let globalBenchmark = 0;

  try {
    for (const page of pages) {
      throwIfAborted(signal);
      const url = `${baseUrl.replace(/\/$/, '')}${page.path === '/' ? '/' : page.path}`;
      for (const preset of presets) {
        throwIfAborted(signal);
        const runMetrics: ReturnType<typeof extractMetrics>[] = [];
        const benchmarks: number[] = [];

        for (let i = 0; i < runs; i++) {
          throwIfAborted(signal);
          options.onProgress?.(`Lighthouse ${preset} ${page.path} run ${i + 1}/${runs}`);
          const { lhr, benchmarkIndex } = await runOnce(url, preset);
          benchmarks.push(benchmarkIndex);
          globalBenchmark = benchmarkIndex;
          const extracted = extractMetrics(lhr);
          runMetrics.push(extracted);

          const rawName = `${page.path.replace(/\//g, '_') || 'home'}_${preset}_${i}.json.gz`;
          const gz = gzipSync(JSON.stringify(lhr));
          fs.writeFileSync(path.join(rawDir, rawName), gz);
        }

        const med = (pick: (m: ReturnType<typeof extractMetrics>) => number) =>
          median(runMetrics.map(pick));

        const medianLcp = med((m) => m.metrics.lcp);
        let detailRun = runMetrics[0]!;
        let bestDelta = Infinity;
        for (const run of runMetrics) {
          const delta = Math.abs(run.metrics.lcp - medianLcp);
          if (delta < bestDelta) {
            bestDelta = delta;
            detailRun = run;
          }
        }

        results.push({
          page: page.path,
          preset,
          runs,
          metrics: {
            lcp: medianLcp,
            fcp: med((m) => m.metrics.fcp),
            tbt: med((m) => m.metrics.tbt),
            cls: med((m) => m.metrics.cls),
            speedIndex: med((m) => m.metrics.speedIndex),
            tti: med((m) => m.metrics.tti),
          },
          categories: {
            performance: med((m) => m.categories.performance),
            accessibility: med((m) => m.categories.accessibility),
            bestPractices: med((m) => m.categories.bestPractices),
            seo: med((m) => m.categories.seo),
          },
          bytes: {
            total: med((m) => m.bytes.total),
            script: med((m) => m.bytes.script),
            image: med((m) => m.bytes.image),
            font: med((m) => m.bytes.font),
            glb: med((m) => m.bytes.glb),
            other: med((m) => m.bytes.other),
          },
          benchmarkIndex: median(benchmarks),
          lcpElement: detailRun.lcpElement,
          lcpPhases: detailRun.lcpPhases,
          opportunities: detailRun.opportunities,
          failedAudits: detailRun.failedAudits,
        });
      }
    }
  } catch (err) {
    if (isAuditAborted(err)) {
      return { benchmarkIndex: globalBenchmark, pages: results, aborted: true };
    }
    throw err;
  }

  return { benchmarkIndex: globalBenchmark, pages: results };
}

import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import type { AuditPage } from '../config/pages.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';

export type LighthousePreset = 'mobile' | 'desktop';

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
}

export interface LighthouseStageResult {
  benchmarkIndex: number;
  pages: LighthousePageMedian[];
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function sumResourceBytes(audits: Record<string, { details?: { items?: Array<{ transferSize?: number; url?: string; mimeType?: string }> } }>): {
  script: number;
  image: number;
  font: number;
  glb: number;
  other: number;
  total: number;
} {
  const items = audits['network-requests']?.details?.items ?? [];
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

async function runOnce(
  url: string,
  preset: LighthousePreset,
): Promise<{ lhr: Record<string, unknown>; benchmarkIndex: number }> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  try {
    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      port: chrome.port,
      formFactor: preset === 'mobile' ? ('mobile' as const) : ('desktop' as const),
      screenEmulation:
        preset === 'mobile'
          ? { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625, disabled: false }
          : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    };
    const runnerResult = await lighthouse(url, options);
    if (!runnerResult?.lhr) throw new Error('Lighthouse returned no report');
    const benchmarkIndex =
      (runnerResult.lhr.environment?.benchmarkIndex as number | undefined) ?? 0;
    return { lhr: runnerResult.lhr as unknown as Record<string, unknown>, benchmarkIndex };
  } finally {
    await chrome.kill();
  }
}

function extractMetrics(lhr: Record<string, unknown>) {
  const a = (lhr.audits ?? {}) as Record<
    string,
    { numericValue?: number; details?: { items?: Array<{ transferSize?: number; url?: string; mimeType?: string }> } }
  >;
  const categories = (lhr.categories ?? {}) as Record<string, { score?: number }>;
  const num = (id: string) => a[id]?.numericValue ?? 0;
  const cat = (id: string) => Math.round((categories[id]?.score ?? 0) * 100);
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
  };
}

export async function runLighthouseStage(options: {
  baseUrl: string;
  pages: AuditPage[];
  runs: number;
  rawDir: string;
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): Promise<LighthouseStageResult & { aborted?: boolean }> {
  const { baseUrl, pages, runs, rawDir, signal } = options;
  const presets: LighthousePreset[] = ['mobile', 'desktop'];
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
          runMetrics.push(extractMetrics(lhr));

          const rawName = `${page.path.replace(/\//g, '_') || 'home'}_${preset}_${i}.json.gz`;
          const gz = gzipSync(JSON.stringify(lhr));
          fs.writeFileSync(path.join(rawDir, rawName), gz);
        }

        const med = (pick: (m: ReturnType<typeof extractMetrics>) => number) =>
          median(runMetrics.map(pick));

        results.push({
          page: page.path,
          preset,
          runs,
          metrics: {
            lcp: med((m) => m.metrics.lcp),
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

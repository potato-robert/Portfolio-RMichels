import type { Page } from '@playwright/test';
import {
  startFrameSampling,
  stopFrameSampling,
  summarizeFrameTimes,
  type FrameSampleMetrics,
} from '../../audit/lib/frame-sampler.ts';
import type { DevicePerformanceTier } from '../../src/lib/device-capability.ts';

export type ScrollPerfBudget = {
  p95MaxMs: number;
  p99MaxMs: number;
  /** Allow at most this many frames longer than 200ms during sampling. */
  maxFramesOver200ms: number;
  maxLongTasks: number;
};

export const SCROLL_PERF_BUDGETS: ScrollPerfBudget = {
  p95MaxMs: 50,
  p99MaxMs: 120,
  maxFramesOver200ms: 1,
  maxLongTasks: 10,
} as const;

/** Per-route overrides — homepage is heavier (waves + landing model + parallax). */
export const SCROLL_PERF_PAGE_BUDGETS: Record<string, Partial<ScrollPerfBudget>> = {
  homepage: { p95MaxMs: 55, p99MaxMs: 200, maxFramesOver200ms: 1, maxLongTasks: 6 },
  projects: { p95MaxMs: 50, p99MaxMs: 120, maxFramesOver200ms: 1, maxLongTasks: 8 },
  clirioScanViews: { p95MaxMs: 50, p99MaxMs: 120, maxFramesOver200ms: 1, maxLongTasks: 10 },
  tourguide: { p95MaxMs: 55, p99MaxMs: 180, maxFramesOver200ms: 1, maxLongTasks: 8 },
  futureEarth: { p95MaxMs: 50, p99MaxMs: 120, maxFramesOver200ms: 1, maxLongTasks: 10 },
};

/** Nested page × tier budgets (static mockup paths are lighter on WebGL). */
export const SCROLL_PERF_TIER_BUDGETS: Record<
  string,
  Partial<Record<DevicePerformanceTier, Partial<ScrollPerfBudget>>>
> = {
  clirioScanViews: {
    full: { p95MaxMs: 55, p99MaxMs: 200, maxFramesOver200ms: 1, maxLongTasks: 10 },
    reduced: { p95MaxMs: 48, p99MaxMs: 110, maxFramesOver200ms: 1, maxLongTasks: 8 },
    minimal: { p95MaxMs: 45, p99MaxMs: 100, maxFramesOver200ms: 0, maxLongTasks: 6 },
  },
  tourguide: {
    full: { p95MaxMs: 55, p99MaxMs: 180, maxFramesOver200ms: 1, maxLongTasks: 8 },
    reduced: { p95MaxMs: 52, p99MaxMs: 160, maxFramesOver200ms: 1, maxLongTasks: 8 },
    minimal: { p95MaxMs: 45, p99MaxMs: 100, maxFramesOver200ms: 0, maxLongTasks: 6 },
  },
};

export function resolveScrollPerfBudget(pageLabel: string, tier?: DevicePerformanceTier): ScrollPerfBudget {
  const base = { ...SCROLL_PERF_BUDGETS, ...SCROLL_PERF_PAGE_BUDGETS[pageLabel] };
  if (tier && SCROLL_PERF_TIER_BUDGETS[pageLabel]?.[tier]) {
    return { ...base, ...SCROLL_PERF_TIER_BUDGETS[pageLabel][tier] };
  }
  return base as ScrollPerfBudget;
}

/** Navigate with audit instrumentation + forced tier (mirrors buildInteractionUrl). */
export async function gotoWithAuditTier(
  page: Page,
  path: string,
  tier?: DevicePerformanceTier,
): Promise<void> {
  const params = new URLSearchParams({ perf: '1' });
  if (tier) params.set('auditTier', tier);
  const qs = params.toString();
  const url = path === '/' ? `/?${qs}` : `${path}?${qs}`;
  await page.goto(url);
}

/** Minimal emulation hints so auditTier override matches intended UX in Playwright. */
export async function applyAuditTierEmulation(
  page: Page,
  tier: DevicePerformanceTier,
): Promise<void> {
  if (tier === 'minimal') {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 4, configurable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4, configurable: true });
    });
  }
}

export type ScrollPerfMetrics = FrameSampleMetrics;

export { summarizeFrameTimes, startFrameSampling, stopFrameSampling };

export function getCpuThrottleRate(): number {
  const raw = process.env.PERF_CPU_THROTTLE;
  if (!raw) return 4;
  const rate = Number(raw);
  return Number.isFinite(rate) && rate >= 1 ? rate : 4;
}

export async function enableCpuThrottle(page: Page, rate: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
}

export async function disableCpuThrottle(page: Page): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
}

export interface ScrollPerfOptions {
  durationMs?: number;
  scrollDelta?: number;
  tickMs?: number;
  warmupMs?: number;
}

export async function measureScrollPerformance(
  page: Page,
  options: ScrollPerfOptions = {},
): Promise<ScrollPerfMetrics> {
  const durationMs = options.durationMs ?? 5000;
  const scrollDelta = options.scrollDelta ?? 100;
  const tickMs = options.tickMs ?? 16;
  const warmupMs = options.warmupMs ?? 400;

  await page.mouse.move(640, 360);

  const warmupEnd = Date.now() + warmupMs;
  while (Date.now() < warmupEnd) {
    await page.mouse.wheel(0, scrollDelta);
    await page.waitForTimeout(tickMs);
  }

  await startFrameSampling(page);

  const start = Date.now();
  while (Date.now() - start < durationMs) {
    await page.mouse.wheel(0, scrollDelta);
    await page.waitForTimeout(tickMs);
  }

  return stopFrameSampling(page, Date.now() - start);
}

/** Wait for scroll-linked effects (particle waves, etc.) before sampling. */
export async function waitForScrollEffectsReady(page: Page): Promise<void> {
  await page
    .waitForFunction(() => {
      const canvas = document.querySelector<HTMLElement>('.wavesCanvas');
      if (!canvas) return true;
      return getComputedStyle(canvas).visibility === 'visible';
    }, { timeout: 15_000 })
    .catch(() => {
      // Particle waves are skipped on some UAs; continue without them.
    });

  await page.waitForTimeout(500);
}

export function formatScrollPerfMetrics(metrics: ScrollPerfMetrics): string {
  return [
    `frames=${metrics.frameCount}`,
    `p50=${metrics.p50.toFixed(1)}ms`,
    `p95=${metrics.p95.toFixed(1)}ms`,
    `p99=${metrics.p99.toFixed(1)}ms`,
    `max=${metrics.max.toFixed(1)}ms`,
    `>50ms=${metrics.framesOver50ms}`,
    `>100ms=${metrics.framesOver100ms}`,
    `>200ms=${metrics.framesOver200ms}`,
    `longTasks=${metrics.longTasks}`,
  ].join(', ');
}

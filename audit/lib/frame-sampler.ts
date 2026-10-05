import type { Page } from '@playwright/test';
import { loadBrowserEvaluateFn } from './browser-scripts.ts';

const startFrameSamplingInPage = loadBrowserEvaluateFn<() => void>(
  'frame-sampler-start.browser.js',
);
const stopFrameSamplingInPage = loadBrowserEvaluateFn<(measuredMs: number) => FrameSampleMetrics>(
  'frame-sampler-stop.browser.js',
);

export interface LoafAttribution {
  sourceURL: string;
  count: number;
}

export interface FrameSampleMetrics {
  frameCount: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
  framesOver50ms: number;
  framesOver100ms: number;
  framesOver200ms: number;
  longTasks: number;
  longAnimationFrames: number;
  durationMs: number;
  effectiveFps: number;
  droppedFramePct: number;
  loafAttribution: LoafAttribution[];
}

declare global {
  interface Window {
    __scrollPerf?: {
      frameTimes: number[];
      sampling: boolean;
      longTasks: number;
      longAnimationFrames: number;
      loafScripts: string[];
      observer?: PerformanceObserver;
      loafObserver?: PerformanceObserver;
      rafId?: number;
    };
  }
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

export function summarizeFrameTimes(
  frameTimes: number[],
  longTasks: number,
  longAnimationFrames: number,
  durationMs: number,
): FrameSampleMetrics {
  const sorted = [...frameTimes].sort((a, b) => a - b);
  const frameCount = frameTimes.length;
  const effectiveFps = durationMs > 0 ? (frameCount / durationMs) * 1000 : 0;
  const framesOver16ms = frameTimes.filter((t) => t > 16.67).length;
  const droppedFramePct = frameCount > 0 ? (framesOver16ms / frameCount) * 100 : 0;
  return {
    frameCount,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted.at(-1) ?? 0,
    framesOver50ms: frameTimes.filter((t) => t > 50).length,
    framesOver100ms: frameTimes.filter((t) => t > 100).length,
    framesOver200ms: frameTimes.filter((t) => t > 200).length,
    longTasks,
    longAnimationFrames,
    durationMs,
    effectiveFps: Math.round(effectiveFps * 10) / 10,
    droppedFramePct: Math.round(droppedFramePct * 10) / 10,
    loafAttribution: [],
  };
}

export async function startFrameSampling(page: Page): Promise<void> {
  await page.evaluate(startFrameSamplingInPage);
}

export async function stopFrameSampling(
  page: Page,
  durationMs: number,
): Promise<FrameSampleMetrics> {
  return page.evaluate(stopFrameSamplingInPage, durationMs);
}

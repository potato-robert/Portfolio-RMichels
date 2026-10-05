import type { Page } from '@playwright/test';

const METRIC_KEYS = [
  'ScriptDuration',
  'LayoutDuration',
  'RecalcStyleDuration',
  'TaskDuration',
  'JSHeapUsedSize',
] as const;

export type CdpPerfDelta = Partial<Record<(typeof METRIC_KEYS)[number], number>>;

function isChromiumCdpError(err: unknown): boolean {
  return /CDP session is only available in Chromium/i.test(String(err));
}

async function readMetrics(page: Page): Promise<Record<string, number> | null> {
  try {
    const cdp = await page.context().newCDPSession(page);
    const { metrics } = await cdp.send('Performance.getMetrics');
    const map: Record<string, number> = {};
    for (const m of metrics) {
      map[m.name] = m.value;
    }
    return map;
  } catch (err) {
    if (isChromiumCdpError(err)) return null;
    throw err;
  }
}

export async function measureCdpPerfDelta(
  page: Page,
  fn: () => Promise<void>,
): Promise<CdpPerfDelta> {
  const before = await readMetrics(page);
  await fn();
  if (before === null) return {};

  const after = await readMetrics(page);
  if (after === null) return {};

  const delta: CdpPerfDelta = {};
  for (const key of METRIC_KEYS) {
    const b = before[key];
    const a = after[key];
    if (b !== undefined && a !== undefined) {
      delta[key] = Math.round((a - b) * 1000) / 1000;
    }
  }
  return delta;
}

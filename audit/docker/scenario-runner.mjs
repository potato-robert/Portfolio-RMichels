/**
 * Shared interaction scenarios for Docker (Chromium + SwiftShader).
 * Emits one JSON line on stdout: { ok, profileId, pagePath, tier?, scenarios?, error? }
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, 'lib');

function loadBrowserFn(filename) {
  let source = fs.readFileSync(path.join(libDir, filename), 'utf8').trim();
  if (source.endsWith(';')) source = source.slice(0, -1);
  return new Function(`return (${source})`)();
}

const startFrameSampling = loadBrowserFn('frame-sampler-start.browser.js');
const stopFrameSampling = loadBrowserFn('frame-sampler-stop.browser.js');

const VALID_TIERS = ['full', 'reduced', 'minimal'];
const TIER_PROBE_TIMEOUT_MS = 30_000;
const SCROLL_WARMUP_MS = 400;
const SCROLL_SAMPLE_MS = 5000;
const SCROLL_TICK_MS = 16;

export async function runDockerScenarios(options) {
  const {
    baseUrl,
    pagePath,
    profileId,
    expectedTier,
    viewport = { width: 1366, height: 768 },
  } = options;

  const params = new URLSearchParams({ perf: '1' });
  if (expectedTier) params.set('auditTier', expectedTier);
  const qs = params.toString();
  const url =
    pagePath === '/'
      ? `${baseUrl.replace(/\/$/, '')}/?${qs}`
      : `${baseUrl.replace(/\/$/, '')}${pagePath}?${qs}`;

  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--no-sandbox'],
  });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const scenarios = [];

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
    await page.locator('body').waitFor({ state: 'visible', timeout: 30_000 });
    await page.waitForFunction(
      ({ expected, valid }) => {
        const tier = document.body?.dataset?.perfTier;
        if (!tier || tier === 'unknown') return false;
        if (expected) return tier === expected;
        return valid.includes(tier);
      },
      { expected: expectedTier ?? null, valid: VALID_TIERS },
      { timeout: TIER_PROBE_TIMEOUT_MS },
    );

    const tier = await page.evaluate(() => document.body.dataset.perfTier ?? 'unknown');
    scenarios.push({
      scenario: 'tier-check',
      tier,
      tierMatch: expectedTier ? tier === expectedTier : undefined,
    });

    await page.evaluate(startFrameSampling);
    const scrollStart = Date.now();
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    const scrollEnd = scrollStart + SCROLL_WARMUP_MS + SCROLL_SAMPLE_MS;
    while (Date.now() < scrollStart + SCROLL_WARMUP_MS) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(SCROLL_TICK_MS);
    }
    while (Date.now() < scrollEnd) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(SCROLL_TICK_MS);
    }
    const scrollMetrics = await page.evaluate(stopFrameSampling, Date.now() - scrollStart);
    scenarios.push({
      scenario: 'scroll',
      metrics: {
        p50: scrollMetrics.p50,
        p95: scrollMetrics.p95,
        p99: scrollMetrics.p99,
        max: scrollMetrics.max,
        effectiveFps: scrollMetrics.effectiveFps,
        droppedFramePct: scrollMetrics.droppedFramePct,
        longTasks: scrollMetrics.longTasks,
        longAnimationFrames: scrollMetrics.longAnimationFrames,
      },
    });

    return { ok: true, profileId, pagePath, tier, scenarios };
  } finally {
    await browser.close();
  }
}

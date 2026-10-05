import { test, expect } from './fixtures';
import type { DevicePerformanceTier } from '../src/lib/device-capability';
import {
  applyAuditTierEmulation,
  disableCpuThrottle,
  enableCpuThrottle,
  formatScrollPerfMetrics,
  getCpuThrottleRate,
  gotoWithAuditTier,
  measureScrollPerformance,
  resolveScrollPerfBudget,
  type ScrollPerfMetrics,
  waitForScrollEffectsReady,
} from './lib/scroll-performance';

test.describe('scroll performance @perf', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 });
  test.use({ viewport: { width: 1280, height: 720 } });

  const throttleRate = getCpuThrottleRate();

  test.beforeEach(async ({ page }) => {
    await enableCpuThrottle(page, throttleRate);
  });

  test.afterEach(async ({ page }) => {
    await disableCpuThrottle(page);
  });

  function assertScrollBudgets(
    metrics: ScrollPerfMetrics,
    pageLabel: string,
    tier?: DevicePerformanceTier,
  ) {
    const budgets = resolveScrollPerfBudget(pageLabel, tier);
    const summary = formatScrollPerfMetrics(metrics);
    test.info().annotations.push({ type: 'scroll-perf', description: `${pageLabel}: ${summary}` });

    expect(
      metrics.p95,
      `${pageLabel} p95 frame time ${metrics.p95.toFixed(1)}ms exceeds ${budgets.p95MaxMs}ms (${summary})`,
    ).toBeLessThanOrEqual(budgets.p95MaxMs);

    expect(
      metrics.p99,
      `${pageLabel} p99 frame time ${metrics.p99.toFixed(1)}ms exceeds ${budgets.p99MaxMs}ms (${summary})`,
    ).toBeLessThanOrEqual(budgets.p99MaxMs);

    expect(
      metrics.framesOver200ms,
      `${pageLabel} frames >200ms ${metrics.framesOver200ms} exceed ${budgets.maxFramesOver200ms} (${summary})`,
    ).toBeLessThanOrEqual(budgets.maxFramesOver200ms);

    expect(
      metrics.longTasks,
      `${pageLabel} long tasks ${metrics.longTasks} exceed ${budgets.maxLongTasks} (${summary})`,
    ).toBeLessThanOrEqual(budgets.maxLongTasks);
  }

  test(`homepage / (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#landingArea')).toBeVisible();
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'homepage');
  });

  test(`projects /projects (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('#Projects')).toBeVisible();
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'projects');
  });

  test(`case study /clirioScanViews full tier (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await gotoWithAuditTier(page, '/clirioScanViews', 'full');
    await expect(page.locator('#projLanding h1')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-perf-tier', 'full');
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'clirioScanViews', 'full');
  });

  test(`case study /clirioScanViews reduced tier (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await applyAuditTierEmulation(page, 'reduced');
    await gotoWithAuditTier(page, '/clirioScanViews', 'reduced');
    await expect(page.locator('#projLanding h1')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-perf-tier', 'reduced');
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'clirioScanViews', 'reduced');
  });

  test(`case study /futureEarth (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await page.goto('/futureEarth');
    await expect(page.locator('#projLanding h1')).toBeVisible();
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'futureEarth');
  });

  test(`case study /tourguide full tier (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await gotoWithAuditTier(page, '/tourguide', 'full');
    await expect(page.locator('#projLanding h1')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-perf-tier', 'full');
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'tourguide', 'full');
  });

  test(`case study /tourguide minimal tier (CPU throttle ${throttleRate}x)`, async ({ page }) => {
    await applyAuditTierEmulation(page, 'minimal');
    await gotoWithAuditTier(page, '/tourguide', 'minimal');
    await expect(page.locator('#projLanding h1')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-perf-tier', 'minimal');
    await waitForScrollEffectsReady(page);

    const metrics = await measureScrollPerformance(page);
    assertScrollBudgets(metrics, 'tourguide', 'minimal');
  });
});

import { chromium, webkit, type Browser } from '@playwright/test';
import { interactionGotoWaitUntil, type AuditPage } from '../config/pages.ts';
import { getProfilesForLevel, filterProfiles, type AuditProfile } from '../config/profiles.ts';
import {
  applyChromiumCdpEmulation,
  applyProfileEmulation,
  chromiumLaunchArgs,
  newContextForProfile,
} from '../lib/emulation.ts';
import { startFrameSampling, stopFrameSampling } from '../lib/frame-sampler.ts';
import { runDockerInteraction } from '../lib/docker.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';
import { loadBrowserEvaluateFn } from '../lib/browser-scripts.ts';
import {
  classifyInteractionFailure,
  profileResultFailed,
  type InteractionFailureKind,
} from '../lib/interaction-failure.ts';
import { buildInteractionUrl } from '../lib/interaction-url.ts';

export interface InteractionScenarioResult {
  scenario: string;
  metrics?: Record<string, number>;
  tier?: string;
  tierMatch?: boolean;
  webglInfo?: Record<string, number> | null;
  notes?: string[];
}

export interface ProfileInteractionResult {
  profileId: string;
  page: string;
  scenarios: InteractionScenarioResult[];
  failed?: boolean;
  failureKind?: InteractionFailureKind;
  error?: string;
  warning?: string;
}

export interface InteractionStageResult {
  profiles: ProfileInteractionResult[];
  aborted?: boolean;
}

declare global {
  interface Window {
    __auditInp?: { value: number | null };
    __auditWebGLInfo?: Record<string, number>;
  }
}

const readPerfTier = loadBrowserEvaluateFn<() => string>('interaction-read-perf-tier.browser.js');
const readWebglInfo = loadBrowserEvaluateFn<
  () => Record<string, number> | null
>('interaction-read-webgl-info.browser.js');
const readNavigationTimingMs = loadBrowserEvaluateFn<() => number>(
  'interaction-navigation-timing.browser.js',
);
const scrollStep = loadBrowserEvaluateFn<() => void>('interaction-scroll-step.browser.js');
const webglReadyCheck = loadBrowserEvaluateFn<() => boolean>('webgl-ready-check.browser.js');

async function launchBrowser(profile: AuditProfile): Promise<Browser> {
  if (profile.browser === 'webkit') {
    return webkit.launch();
  }
  return chromium.launch({
    args: chromiumLaunchArgs(profile),
  });
}

function pageNeedsIsolatedBrowser(auditPage: AuditPage): boolean {
  return auditPage.tags.includes('webgl-heavy');
}

async function waitForWebGlReady(page: import('@playwright/test').Page): Promise<number> {
  const start = Date.now();
  await page
    .waitForFunction(webglReadyCheck, { timeout: 30_000 })
    .catch(() => {});
  return Date.now() - start;
}

const GOTO_TIMEOUT_MS = 120_000;

async function gotoForInteraction(
  page: import('@playwright/test').Page,
  url: string,
  auditPage: AuditPage,
): Promise<void> {
  const waitUntil = interactionGotoWaitUntil(auditPage);
  await page.goto(url, { waitUntil, timeout: GOTO_TIMEOUT_MS });
  if (waitUntil === 'load') {
    await page.locator('body').waitFor({ state: 'visible', timeout: 30_000 });
  }
}

async function reloadForInteraction(
  page: import('@playwright/test').Page,
  auditPage: AuditPage,
  url: string,
): Promise<void> {
  const waitUntil = interactionGotoWaitUntil(auditPage);
  await page.goto(url, { waitUntil, timeout: GOTO_TIMEOUT_MS });
}

/** WebKit rejects `mouse.wheel` on mobile; use programmatic scroll for all WebKit profiles. */
async function runScrollScenario(
  page: import('@playwright/test').Page,
  profile: AuditProfile,
): Promise<void> {
  const steps = 80;
  const useProgrammaticScroll = profile.browser === 'webkit';

  if (useProgrammaticScroll) {
    for (let i = 0; i < steps; i++) {
      await page.evaluate(scrollStep);
      await page.waitForTimeout(16);
    }
    return;
  }

  if (profile.hasTouch) {
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, 80);
      await page.waitForTimeout(16);
    }
    return;
  }

  await page.mouse.move(profile.viewport.width / 2, profile.viewport.height / 2);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(16);
  }
}

async function runScenariosForPage(
  profile: AuditProfile,
  page: import('@playwright/test').Page,
  auditPage: AuditPage,
  baseUrl: string,
  trace: boolean,
  emulationNotes: string[],
): Promise<InteractionScenarioResult[]> {
  const url = buildInteractionUrl(baseUrl, auditPage.path, profile);
  const scenarios: InteractionScenarioResult[] = [];
  const notes = [...emulationNotes, ...(await applyChromiumCdpEmulation(page, profile))];

  if (trace) {
    await page.context().tracing.start({ screenshots: true, snapshots: true });
  }

  await gotoForInteraction(page, url, auditPage);
  const coldMs = await page.evaluate(readNavigationTimingMs);
  scenarios.push({ scenario: 'cold-load', metrics: { durationMs: coldMs }, notes: [...notes] });

  const tier = await page.evaluate(readPerfTier);
  if (profile.expectedTier) {
    scenarios.push({
      scenario: 'tier-check',
      tier,
      tierMatch: tier === profile.expectedTier,
    });
  }

  const webglMs = await waitForWebGlReady(page);
  scenarios.push({ scenario: 'first-webgl-frame', metrics: { durationMs: webglMs } });

  await reloadForInteraction(page, auditPage, url);
  const warmMs = await page.evaluate(readNavigationTimingMs);
  scenarios.push({ scenario: 'warm-load', metrics: { durationMs: warmMs } });

  await startFrameSampling(page);
  const scrollStart = Date.now();
  await runScrollScenario(page, profile);
  const scrollMetrics = await stopFrameSampling(page, Date.now() - scrollStart);
  scenarios.push({
    scenario: 'scroll',
    metrics: {
      p50: scrollMetrics.p50,
      p95: scrollMetrics.p95,
      max: scrollMetrics.max,
      longTasks: scrollMetrics.longTasks,
      longAnimationFrames: scrollMetrics.longAnimationFrames,
    },
  });

  await startFrameSampling(page);
  const mouseStart = Date.now();
  const w = profile.viewport.width;
  const h = profile.viewport.height;
  for (let x = 0; x < w; x += 40) {
    await page.mouse.move(x, h / 2);
    await page.waitForTimeout(8);
  }
  const mouseMetrics = await stopFrameSampling(page, Date.now() - mouseStart);
  scenarios.push({
    scenario: 'mouse-sweep',
    metrics: { p95: mouseMetrics.p95, max: mouseMetrics.max },
  });

  await startFrameSampling(page);
  await page.waitForTimeout(5000);
  const idleMetrics = await stopFrameSampling(page, 5000);
  scenarios.push({
    scenario: 'idle-5s',
    metrics: { p95: idleMetrics.p95, max: idleMetrics.max },
  });

  const webglInfo = await page.evaluate(readWebglInfo);
  if (webglInfo) {
    scenarios.push({ scenario: 'webgl-info', webglInfo });
  }

  if (trace) {
    await page.context().tracing.stop({ path: undefined });
  }

  return scenarios;
}

function pushProfileResult(
  results: ProfileInteractionResult[],
  row: ProfileInteractionResult,
): void {
  results.push(row);
}

function resultFromScenarios(
  profile: AuditProfile,
  auditPage: AuditPage,
  scenarios: InteractionScenarioResult[],
): ProfileInteractionResult {
  const tierScenario = scenarios.find((s) => s.scenario === 'tier-check');
  const tierMismatch = tierScenario?.tierMatch === false;
  const failureKind = classifyInteractionFailure({ tierMismatch });
  const warning = tierMismatch
    ? `expected tier ${profile.expectedTier}, got ${tierScenario?.tier}`
    : undefined;
  return {
    profileId: profile.id,
    page: auditPage.path,
    scenarios,
    failureKind,
    warning,
    failed: profileResultFailed(failureKind, false),
  };
}

export async function runInteractionStage(options: {
  level: 'quick' | 'full';
  pages: AuditPage[];
  baseUrl: string;
  profileIds?: string[];
  trace?: boolean;
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): Promise<InteractionStageResult> {
  const onProgress = options.onProgress;
  const allProfiles = filterProfiles(getProfilesForLevel(options.level), options.profileIds);
  const hostProfiles = allProfiles.filter((p) => !p.docker);
  const dockerProfiles = allProfiles.filter((p) => p.docker);
  const pageCount = options.pages.length;
  const totalJobs =
    hostProfiles.length * pageCount + dockerProfiles.length * pageCount;
  let jobIndex = 0;

  onProgress?.(
    `Interaction: ${allProfiles.length} profiles × ${pageCount} pages (${totalJobs} runs)`,
  );

  const results: ProfileInteractionResult[] = [];

  try {
    for (let pi = 0; pi < hostProfiles.length; pi++) {
      throwIfAborted(options.signal);
      const profile = hostProfiles[pi]!;
      onProgress?.(
        `Interaction profile ${profile.id} (${pi + 1}/${hostProfiles.length}, ${profile.browser})`,
      );

      let sharedBrowser: Browser | null = null;

      try {
        for (const auditPage of options.pages) {
          throwIfAborted(options.signal);
          jobIndex++;
          onProgress?.(
            `Interaction ${profile.id} ${auditPage.path} (${jobIndex}/${totalJobs})`,
          );

          const isolate = pageNeedsIsolatedBrowser(auditPage);
          if (isolate && sharedBrowser) {
            await sharedBrowser.close();
            sharedBrowser = null;
          }
          if (isolate || !sharedBrowser) {
            if (sharedBrowser) await sharedBrowser.close();
            try {
              sharedBrowser = await launchBrowser(profile);
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              const failureKind = classifyInteractionFailure({ error: message }) ?? 'launch';
              pushProfileResult(results, {
                profileId: profile.id,
                page: auditPage.path,
                scenarios: [],
                failed: true,
                failureKind,
                error: message,
              });
              sharedBrowser = null;
              continue;
            }
          }

          const browser = sharedBrowser!;
          const context = await newContextForProfile(browser, profile);
          const emulationNotes = await applyProfileEmulation(context, profile);
          const page = await context.newPage();
          try {
            const scenarios = await runScenariosForPage(
              profile,
              page,
              auditPage,
              options.baseUrl,
              options.trace ?? false,
              emulationNotes,
            );
            pushProfileResult(results, resultFromScenarios(profile, auditPage, scenarios));
          } catch (err) {
            if (isAuditAborted(err)) throw err;
            const message = err instanceof Error ? err.message : String(err);
            const failureKind = classifyInteractionFailure({ error: message }) ?? 'unknown';
            pushProfileResult(results, {
              profileId: profile.id,
              page: auditPage.path,
              scenarios: [],
              failed: profileResultFailed(failureKind, true),
              failureKind,
              error: message,
            });
            if (isolate && sharedBrowser) {
              await sharedBrowser.close().catch(() => {});
              sharedBrowser = null;
            }
          } finally {
            await context.close();
          }
        }
      } finally {
        if (sharedBrowser) await sharedBrowser.close();
      }
    }

    for (let pi = 0; pi < dockerProfiles.length; pi++) {
      throwIfAborted(options.signal);
      const profile = dockerProfiles[pi]!;
      onProgress?.(
        `Interaction Docker profile ${profile.id} (${pi + 1}/${dockerProfiles.length})`,
      );
      for (const auditPage of options.pages) {
        throwIfAborted(options.signal);
        jobIndex++;
        onProgress?.(
          `Interaction ${profile.id} ${auditPage.path} (${jobIndex}/${totalJobs})`,
        );
        const dockerResult = runDockerInteraction(
          profile,
          options.baseUrl,
          [auditPage.path, profile.id],
          onProgress,
        );
        const dockerFailed = dockerResult.exitCode !== 0;
        const failureKind = classifyInteractionFailure({
          dockerFailed,
          error: dockerResult.stderr,
        });
        pushProfileResult(results, {
          profileId: profile.id,
          page: auditPage.path,
          scenarios: [
            {
              scenario: 'docker-delegated',
              notes: [dockerResult.stdout, dockerResult.stderr].filter(Boolean),
            },
          ],
          failed: profileResultFailed(failureKind, dockerFailed),
          failureKind,
          error: dockerFailed ? dockerResult.stderr || 'docker run failed' : undefined,
        });
      }
    }
  } catch (err) {
    if (isAuditAborted(err)) {
      return { profiles: results, aborted: true };
    }
    throw err;
  }

  return { profiles: results };
}

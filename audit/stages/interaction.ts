import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium, webkit, type Browser } from '@playwright/test';
import { interactionGotoWaitUntil, type AuditPage } from '../config/pages.ts';
import { getProfilesForLevel, filterProfiles, type AuditProfile } from '../config/profiles.ts';
import { measureCdpPerfDelta } from '../lib/cdp-performance.ts';
import {
  applyChromiumCdpEmulation,
  applyProfileEmulation,
  chromiumLaunchArgs,
  newContextForProfile,
} from '../lib/emulation.ts';
import { startFrameSampling, stopFrameSampling, type FrameSampleMetrics } from '../lib/frame-sampler.ts';
import { parseDockerInteractionOutput, runDockerInteraction } from '../lib/docker.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';
import { loadBrowserEvaluateFn } from '../lib/browser-scripts.ts';
import { forceClosePlaywright } from '../lib/force-close-browser.ts';
import {
  registerInteractionAbortTeardown,
  setActiveInteractionSession,
} from '../lib/interaction-active-session.ts';
import {
  interactionJobTimeoutMs,
  pageNeedsIsolatedBrowser,
} from '../lib/interaction-job-timeout.ts';
import {
  classifyInteractionFailure,
  profileResultFailed,
  type InteractionFailureKind,
} from '../lib/interaction-failure.ts';
import { buildInteractionUrl } from '../lib/interaction-url.ts';
import { runWithTimeout } from '../lib/run-with-timeout.ts';

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
const startInpObserver = loadBrowserEvaluateFn<() => void>('inp-observer.browser.js');
const readInp = loadBrowserEvaluateFn<
  () => { inpMs: number | null; eventEntries: number }
>('read-inp.browser.js');

const SCROLL_WARMUP_MS = 400;
const SCROLL_SAMPLE_MS = 5000;
const SCROLL_TICK_MS = 16;
const PAGE_ACTION_TIMEOUT_MS = 45_000;
const GOTO_TIMEOUT_MS = 120_000;
const WEBKIT_GOTO_TIMEOUT_MS = 60_000;
const IDLE_SAMPLE_MS_DEFAULT = 5000;
const IDLE_SAMPLE_MS_WEBKIT = 2000;

interface ScenariosRunOptions {
  signal?: AbortSignal;
  onStep?: (step: string) => void;
  fullScenarios?: boolean;
  lastStep?: { value: string };
}

function navigationTimeoutMs(profile: AuditProfile): number {
  return profile.browser === 'webkit' ? WEBKIT_GOTO_TIMEOUT_MS : GOTO_TIMEOUT_MS;
}

function logStep(opts: ScenariosRunOptions, step: string): void {
  if (opts.lastStep) opts.lastStep.value = step;
  opts.onStep?.(step);
}

function configureInteractionPage(page: import('@playwright/test').Page, profile: AuditProfile): void {
  page.setDefaultTimeout(PAGE_ACTION_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(navigationTimeoutMs(profile));
}

function scrollMetricsRecord(m: FrameSampleMetrics): Record<string, number> {
  return {
    p50: m.p50,
    p95: m.p95,
    p99: m.p99,
    max: m.max,
    effectiveFps: m.effectiveFps,
    droppedFramePct: m.droppedFramePct,
    longTasks: m.longTasks,
    longAnimationFrames: m.longAnimationFrames,
    frameCount: m.frameCount,
    framesOver200ms: m.framesOver200ms,
  };
}

async function launchBrowser(profile: AuditProfile): Promise<Browser> {
  if (profile.browser === 'webkit') {
    return webkit.launch();
  }
  return chromium.launch({
    args: chromiumLaunchArgs(profile),
  });
}

async function waitForWebGlReady(page: import('@playwright/test').Page): Promise<number> {
  const start = Date.now();
  await page
    .waitForFunction(webglReadyCheck, { timeout: 30_000 })
    .catch(() => {});
  return Date.now() - start;
}

async function gotoForInteraction(
  page: import('@playwright/test').Page,
  profile: AuditProfile,
  url: string,
  auditPage: AuditPage,
): Promise<void> {
  const waitUntil = interactionGotoWaitUntil(auditPage);
  const timeout = navigationTimeoutMs(profile);
  await page.goto(url, { waitUntil, timeout });
  if (waitUntil === 'load') {
    await page.locator('body').waitFor({ state: 'visible', timeout: 30_000 });
  }
}

async function reloadForInteraction(
  page: import('@playwright/test').Page,
  profile: AuditProfile,
  auditPage: AuditPage,
  url: string,
): Promise<void> {
  const waitUntil = interactionGotoWaitUntil(auditPage);
  await page.goto(url, { waitUntil, timeout: navigationTimeoutMs(profile) });
}

function skipWarmReload(profile: AuditProfile, auditPage: AuditPage, fullScenarios: boolean): boolean {
  if (fullScenarios) return false;
  return profile.browser === 'webkit' && pageNeedsIsolatedBrowser(auditPage);
}

function skipMouseSweep(profile: AuditProfile, fullScenarios: boolean): boolean {
  if (fullScenarios) return false;
  return profile.browser === 'webkit';
}

function idleSampleMs(profile: AuditProfile, fullScenarios: boolean): number {
  if (fullScenarios || profile.browser !== 'webkit') return IDLE_SAMPLE_MS_DEFAULT;
  return IDLE_SAMPLE_MS_WEBKIT;
}

/** WebKit rejects `mouse.wheel` on mobile; use programmatic scroll for all WebKit profiles. */
async function wheelOrProgrammaticScroll(
  page: import('@playwright/test').Page,
  profile: AuditProfile,
  durationMs: number,
  deltaY: number,
): Promise<void> {
  const useProgrammaticScroll = profile.browser === 'webkit';
  const start = Date.now();
  if (!useProgrammaticScroll) {
    await page.mouse.move(profile.viewport.width / 2, profile.viewport.height / 2);
  }
  while (Date.now() - start < durationMs) {
    if (useProgrammaticScroll) {
      await page.evaluate(scrollStep);
    } else {
      await page.mouse.wheel(0, deltaY);
    }
    await page.waitForTimeout(SCROLL_TICK_MS);
  }
}

async function runScrollWithWarmup(
  page: import('@playwright/test').Page,
  profile: AuditProfile,
): Promise<void> {
  const delta = profile.hasTouch ? 80 : 100;
  await wheelOrProgrammaticScroll(page, profile, SCROLL_WARMUP_MS, delta);
  await wheelOrProgrammaticScroll(page, profile, SCROLL_SAMPLE_MS, delta);
}

async function runClickInteractionScenarios(
  page: import('@playwright/test').Page,
  auditPage: AuditPage,
): Promise<InteractionScenarioResult[]> {
  const scenarios: InteractionScenarioResult[] = [];
  await page.evaluate(startInpObserver);

  const homePaths = new Set(['/', '/de']);
  if (homePaths.has(auditPage.path)) {
    await startFrameSampling(page);
    const t0 = Date.now();
    await page.locator('#MenuToggle').click();
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    const menuMetrics = await stopFrameSampling(page, Date.now() - t0);
    const inp = await page.evaluate(readInp);
    scenarios.push({
      scenario: 'click-menu',
      metrics: {
        ...scrollMetricsRecord(menuMetrics),
        inpMs: inp.inpMs ?? 0,
      },
    });
    await page.evaluate(startInpObserver);
  }

  if (auditPage.path === '/projects' || auditPage.path === '/de/projects') {
    await startFrameSampling(page);
    const t0 = Date.now();
    const btn = page.locator('.filterBtn[data-js="vr"]');
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(300);
      await btn.click();
    }
    const filterMetrics = await stopFrameSampling(page, Date.now() - t0);
    const inp = await page.evaluate(readInp);
    scenarios.push({
      scenario: 'click-filter',
      metrics: {
        ...scrollMetricsRecord(filterMetrics),
        inpMs: inp.inpMs ?? 0,
      },
    });
    await page.evaluate(startInpObserver);
  }

  if (auditPage.slug && !auditPage.tags.includes('development')) {
    const gallery = page.locator('#projContent .sectionMedia figure img').first();
    if (await gallery.count()) {
      await gallery.scrollIntoViewIfNeeded();
      await startFrameSampling(page);
      const t0 = Date.now();
      await gallery.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const lbMetrics = await stopFrameSampling(page, Date.now() - t0);
      const inp = await page.evaluate(readInp);
      scenarios.push({
        scenario: 'click-lightbox',
        metrics: {
          ...scrollMetricsRecord(lbMetrics),
          inpMs: inp.inpMs ?? 0,
        },
      });
    }
  }

  return scenarios;
}

function traceArtifactPath(
  rawDir: string | undefined,
  auditPage: AuditPage,
  profile: AuditProfile,
): string | undefined {
  if (!rawDir) return undefined;
  const safePage = auditPage.path.replace(/\//g, '_') || 'home';
  return path.join(rawDir, `trace_${safePage}_${profile.id}.zip`);
}

async function runScenariosForPage(
  profile: AuditProfile,
  page: import('@playwright/test').Page,
  auditPage: AuditPage,
  baseUrl: string,
  trace: boolean,
  rawDir: string | undefined,
  emulationNotes: string[],
  runOpts: ScenariosRunOptions = {},
): Promise<InteractionScenarioResult[]> {
  const fullScenarios = runOpts.fullScenarios === true;
  const url = buildInteractionUrl(baseUrl, auditPage.path, profile);
  const scenarios: InteractionScenarioResult[] = [];
  const notes = [...emulationNotes, ...(await applyChromiumCdpEmulation(page, profile))];

  const tracePath = trace ? traceArtifactPath(rawDir, auditPage, profile) : undefined;
  if (tracePath) {
    logStep(runOpts, 'trace-start');
    throwIfAborted(runOpts.signal);
    await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  logStep(runOpts, 'cold-goto');
  throwIfAborted(runOpts.signal);
  await gotoForInteraction(page, profile, url, auditPage);
  const coldMs = await page.evaluate(readNavigationTimingMs);
  scenarios.push({ scenario: 'cold-load', metrics: { durationMs: coldMs }, notes: [...notes] });

  logStep(runOpts, 'tier-check');
  throwIfAborted(runOpts.signal);
  const tier = await page.evaluate(readPerfTier);
  if (profile.expectedTier) {
    scenarios.push({
      scenario: 'tier-check',
      tier,
      tierMatch: tier === profile.expectedTier,
    });
  }

  logStep(runOpts, 'webgl-wait');
  throwIfAborted(runOpts.signal);
  const webglMs = await waitForWebGlReady(page);
  scenarios.push({ scenario: 'first-webgl-frame', metrics: { durationMs: webglMs } });

  if (skipWarmReload(profile, auditPage, fullScenarios)) {
    logStep(runOpts, 'warm-goto-skipped');
    scenarios.push({
      scenario: 'warm-load-skipped',
      notes: ['warm reload skipped on WebKit webgl-heavy (audit stability)'],
    });
  } else {
    logStep(runOpts, 'warm-goto');
    throwIfAborted(runOpts.signal);
    await reloadForInteraction(page, profile, auditPage, url);
    const warmMs = await page.evaluate(readNavigationTimingMs);
    scenarios.push({ scenario: 'warm-load', metrics: { durationMs: warmMs } });
  }

  logStep(runOpts, 'scroll');
  throwIfAborted(runOpts.signal);
  await startFrameSampling(page);
  const scrollStart = Date.now();
  const cdpDelta = await measureCdpPerfDelta(page, async () => {
    await runScrollWithWarmup(page, profile);
  });
  const scrollMetrics = await stopFrameSampling(page, Date.now() - scrollStart);
  scenarios.push({
    scenario: 'scroll',
    metrics: {
      ...scrollMetricsRecord(scrollMetrics),
      ...cdpDelta,
    },
    notes: scrollMetrics.loafAttribution.length
      ? scrollMetrics.loafAttribution.map((a) => `LoAF: ${a.sourceURL} (${a.count})`)
      : undefined,
  });

  logStep(runOpts, 'click-scenarios');
  throwIfAborted(runOpts.signal);
  scenarios.push(...(await runClickInteractionScenarios(page, auditPage)));

  if (skipMouseSweep(profile, fullScenarios)) {
    logStep(runOpts, 'mouse-sweep-skipped');
    scenarios.push({
      scenario: 'mouse-sweep-skipped',
      notes: ['mouse sweep skipped on WebKit (audit stability)'],
    });
  } else {
    logStep(runOpts, 'mouse-sweep');
    throwIfAborted(runOpts.signal);
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
  }

  const idleMs = idleSampleMs(profile, fullScenarios);
  const idleScenario = idleMs === IDLE_SAMPLE_MS_DEFAULT ? 'idle-5s' : 'idle-2s';
  logStep(runOpts, idleScenario);
  throwIfAborted(runOpts.signal);
  await startFrameSampling(page);
  await page.waitForTimeout(idleMs);
  const idleMetrics = await stopFrameSampling(page, idleMs);
  scenarios.push({
    scenario: idleScenario,
    metrics: { p95: idleMetrics.p95, max: idleMetrics.max },
  });

  logStep(runOpts, 'webgl-info');
  throwIfAborted(runOpts.signal);
  const webglInfo = await page.evaluate(readWebglInfo);
  if (webglInfo) {
    scenarios.push({ scenario: 'webgl-info', webglInfo });
  }

  if (tracePath) {
    logStep(runOpts, 'trace-stop');
    throwIfAborted(runOpts.signal);
    await page.context().tracing.stop({ path: tracePath });
    const gzPath = `${tracePath}.gz`;
    fs.writeFileSync(gzPath, gzipSync(fs.readFileSync(tracePath)));
    fs.unlinkSync(tracePath);
  }

  logStep(runOpts, 'done');
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
  rawDir?: string;
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
  interactionJobTimeoutMs?: number;
  interactionFullScenarios?: boolean;
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
  const disposeAbortTeardown = registerInteractionAbortTeardown(options.signal);

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
          const jobLabel = `${profile.id} ${auditPage.path}`;
          onProgress?.(`Interaction ${jobLabel} (${jobIndex}/${totalJobs})`);

          const isolate = pageNeedsIsolatedBrowser(auditPage);
          const maxAttempts = isolate ? 2 : 1;
          let recorded = false;

          for (let attempt = 0; attempt < maxAttempts && !recorded; attempt++) {
            if (attempt > 0) {
              onProgress?.(`Interaction ${jobLabel}: retry after failure (attempt ${attempt + 1})`);
              await forceClosePlaywright(null, sharedBrowser);
              sharedBrowser = null;
            }

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
                recorded = true;
                break;
              }
            }

            const browser = sharedBrowser!;
            const context = await newContextForProfile(browser, profile);
            const emulationNotes = await applyProfileEmulation(context, profile);
            const page = await context.newPage();
            configureInteractionPage(page, profile);
            setActiveInteractionSession({ context, browser });

            const lastStep = { value: 'starting' };
            const jobTimeout = interactionJobTimeoutMs(
              profile,
              auditPage,
              options.interactionJobTimeoutMs,
            );

            try {
              const scenarios = await runWithTimeout(
                jobLabel,
                jobTimeout,
                () => lastStep.value,
                () =>
                  runScenariosForPage(
                    profile,
                    page,
                    auditPage,
                    options.baseUrl,
                    options.trace ?? false,
                    options.rawDir,
                    emulationNotes,
                    {
                      signal: options.signal,
                      fullScenarios: options.interactionFullScenarios,
                      lastStep,
                      onStep: (step) => onProgress?.(`Interaction ${jobLabel}: ${step}`),
                    },
                  ),
              );
              pushProfileResult(results, resultFromScenarios(profile, auditPage, scenarios));
              recorded = true;
            } catch (err) {
              if (isAuditAborted(err)) throw err;
              const message = err instanceof Error ? err.message : String(err);
              const failureKind =
                classifyInteractionFailure({ err, error: message }) ?? 'unknown';
              const retriable =
                isolate &&
                attempt < maxAttempts - 1 &&
                (failureKind === 'timeout' || failureKind === 'crash');
              if (retriable) {
                onProgress?.(`Interaction ${jobLabel}: ${failureKind}, will retry`);
                await forceClosePlaywright(context, isolate ? browser : null);
                if (isolate) {
                  sharedBrowser = null;
                }
                continue;
              }
              pushProfileResult(results, {
                profileId: profile.id,
                page: auditPage.path,
                scenarios: [],
                failed: profileResultFailed(failureKind, true),
                failureKind,
                error: message,
              });
              recorded = true;
              if (isolate) {
                await forceClosePlaywright(context, browser);
                sharedBrowser = null;
              }
            } finally {
              setActiveInteractionSession(null);
              await forceClosePlaywright(context, isolate ? null : null);
            }
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
        const dockerTimeout =
          (options.interactionJobTimeoutMs ?? interactionJobTimeoutMs(profile, auditPage)) + 30_000;
        const dockerResult = runDockerInteraction(
          profile,
          options.baseUrl,
          [auditPage.path, profile.id],
          onProgress,
          dockerTimeout,
        );
        const parsed = parseDockerInteractionOutput(dockerResult.stdout);
        const dockerFailed = dockerResult.exitCode !== 0 || parsed?.ok === false;
        const failureKind = classifyInteractionFailure({
          dockerFailed,
          error: dockerResult.stderr || parsed?.error,
        });
        pushProfileResult(results, {
          profileId: profile.id,
          page: auditPage.path,
          scenarios: parsed?.scenarios ?? [
            {
              scenario: 'docker-delegated',
              notes: [dockerResult.stdout, dockerResult.stderr].filter(Boolean),
            },
          ],
          failed: profileResultFailed(failureKind, dockerFailed),
          failureKind,
          error: dockerFailed
            ? parsed?.error || dockerResult.stderr || 'docker run failed'
            : undefined,
        });
      }
    }
  } catch (err) {
    if (isAuditAborted(err)) {
      return { profiles: results, aborted: true };
    }
    throw err;
  } finally {
    disposeAbortTeardown();
    setActiveInteractionSession(null);
  }

  return { profiles: results };
}

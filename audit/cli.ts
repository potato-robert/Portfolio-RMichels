#!/usr/bin/env node

import path from 'node:path';

import { fileURLToPath } from 'node:url';

import { loadPageInventory, pagesForInteraction } from './config/pages.ts';

import { getProfilesForLevel, filterProfiles } from './config/profiles.ts';

import { runCiGate } from './stages/ci-gate.ts';

import { runLighthouseStage } from './stages/lighthouse.ts';

import { runSeoStage } from './stages/seo.ts';

import { runInteractionStage } from './stages/interaction.ts';

import { ensurePreviewServer, needsPreviewServer, prodBaseUrl } from './lib/server.ts';

import { createRunDir, getGitState } from './lib/snapshot.ts';

import { applyPlaywrightEnvForAudit } from './lib/playwright-env.ts';
import {
  interactionHasHardFailures,
  type InteractionFailureKind,
} from './lib/interaction-failure.ts';

import { runPreflight, formatPreflightFailure } from './lib/preflight.ts';

import {
  formatDockerSmokeFailure,
  runDockerSmoke,
  shouldRunDockerSmoke,
} from './lib/docker-smoke.ts';

import { finalizeAuditRun, serializeAuditError, type AuditFailure } from './lib/finalize-run.ts';

import { createAuditAbort, isAuditAborted } from './lib/abort.ts';



export type AuditLevel = 'quick' | 'full';

export type AuditTarget = 'local' | 'prod';



export interface CliOptions {

  level: AuditLevel;

  target: AuditTarget;

  stages: Set<string>;

  pages?: string[];

  allPages: boolean;

  profiles?: string[];

  runs: number;

  trace: boolean;

  continueOnFail: boolean;

  label: string;

  skipCiGate: boolean;

  skipPreflight: boolean;

  interactionJobTimeoutMs?: number;

  interactionFullScenarios: boolean;

}



const ALL_STAGES = ['ci-gate', 'lighthouse', 'seo', 'interaction'] as const;



function parseArgs(argv: string[]): CliOptions {

  let level: AuditLevel = 'full';

  let target: AuditTarget = 'local';

  const stages = new Set<string>(ALL_STAGES);

  let pages: string[] | undefined;

  let allPages = false;

  let profiles: string[] | undefined;

  let runs = 0;

  let trace = false;

  let continueOnFail = false;

  let label = '';

  let skipCiGate = false;

  let skipPreflight = false;

  let interactionJobTimeoutMs: number | undefined;

  let interactionFullScenarios = false;



  for (let i = 0; i < argv.length; i++) {

    const arg = argv[i];

    if (arg === '--level' && argv[i + 1]) {

      level = argv[++i] as AuditLevel;

    } else if (arg === '--target' && argv[i + 1]) {

      target = argv[++i] as AuditTarget;

    } else if (arg === '--stages' && argv[i + 1]) {

      stages.clear();

      for (const s of argv[++i]!.split(',')) stages.add(s.trim());

    } else if (arg === '--pages' && argv[i + 1]) {

      pages = argv[++i]!.split(',').map((p) => p.trim());

    } else if (arg === '--all-pages') allPages = true;

    else if (arg === '--profiles' && argv[i + 1]) {

      profiles = argv[++i]!.split(',').map((p) => p.trim());

    } else if (arg === '--runs' && argv[i + 1]) {

      runs = Number(argv[++i]);

    } else if (arg === '--trace') trace = true;

    else if (arg === '--continue-on-fail') continueOnFail = true;

    else if (arg === '--label' && argv[i + 1]) label = argv[++i]!;

    else if (arg === '--skip-ci-gate') skipCiGate = true;

    else if (arg === '--skip-preflight') skipPreflight = true;

    else if (arg === '--interaction-job-timeout-ms' && argv[i + 1]) {
      interactionJobTimeoutMs = Number(argv[++i]);
    } else if (arg === '--interaction-full-scenarios') interactionFullScenarios = true;

  }



  if (!runs) runs = level === 'quick' ? 3 : 5;

  if (!label) label = 'local';



  return {

    level,

    target,

    stages,

    pages,

    allPages,

    profiles,

    runs,

    trace,

    continueOnFail,

    label,

    skipCiGate,

    skipPreflight,

    interactionJobTimeoutMs,

    interactionFullScenarios,

  };

}



function stageError(stage: string, err: unknown): AuditFailure {

  const message = err instanceof Error ? err.message : String(err);

  return {

    stage,

    message,

    stack: err instanceof Error ? err.stack : undefined,

  };

}



function noteUserAbort(

  err: unknown,

  failureRef: { current?: AuditFailure },

  exitCodeRef: { current: number },

): boolean {

  if (!isAuditAborted(err)) return false;

  failureRef.current = { stage: 'aborted', message: err.message };

  exitCodeRef.current = 130;

  return true;

}



function markAbortedStage(

  stage: string,

  detail: string,

  failureRef: { current?: AuditFailure },

  exitCodeRef: { current: number },

): void {

  failureRef.current = { stage: 'aborted', message: `${stage} stopped early (${detail})` };

  exitCodeRef.current = 130;

}



export async function runAudit(argv: string[]): Promise<number> {

  applyPlaywrightEnvForAudit();

  const opts = parseArgs(argv);

  const profileList = filterProfiles(getProfilesForLevel(opts.level), opts.profiles);

  const startedAt = new Date().toISOString();

  const git = getGitState();

  const { runDir, runId, worktree } = createRunDir(opts.level, opts.label);



  const abort = createAuditAbort();

  abort.registerProcessHandlers();

  console.log(

    'Clean abort: press q in this window (writes snapshot; press q again to force quit without snapshot). Closing the window skips the snapshot.',

  );



  const summary: Record<string, unknown> = {};

  let exitCode = 0;

  let failure: AuditFailure | undefined;

  const failureRef = { current: failure };

  const exitCodeRef = { current: exitCode };

  let finalized = false;

  let benchmarkIndex: number | undefined;

  let preflightResult: Awaited<ReturnType<typeof runPreflight>> | undefined;



  const logProgress = (msg: string) => console.log(msg);

  let previewStop: (() => void) | null = null;

  let baseUrl = opts.target === 'prod' ? prodBaseUrl() : 'http://127.0.0.1:4321';



  const finalizeOnce = () => {

    if (finalized) return;

    finalized = true;

    failure = failureRef.current;

    exitCode = exitCodeRef.current;

    finalizeAuditRun({

      runDir,

      runId,

      worktree,

      opts,

      profileList,

      summary,

      git,

      exitCode,

      benchmarkIndex,

      startedAt,

      preflight: preflightResult,

      failure,

    });

  };



  try {

    if (!opts.skipPreflight) {

      console.log('Stage: preflight');

      preflightResult = await runPreflight({

        stages: opts.stages,

        skipCiGate: opts.skipCiGate,

        target: opts.target,

        profiles: profileList,

        onProgress: logProgress,

      });

      summary.preflight = preflightResult;

      if (!preflightResult.passed) {

        failure = {

          stage: 'preflight',

          message: formatPreflightFailure(preflightResult),

        };

        exitCodeRef.current = 1;

        failureRef.current = failure;

        console.error(failure.message);

        return exitCodeRef.current;

      }

    }



    if (opts.target === 'local' && needsPreviewServer(opts.stages)) {

      const preview = await ensurePreviewServer();

      if (preview) previewStop = preview.stop;

      baseUrl = preview?.baseUrl ?? baseUrl;

    }



    const { pages, sitemapPaths } = loadPageInventory({

      target: opts.target,

      pageFilter: opts.pages,

      allPages: opts.allPages,

    });

    if (!opts.pages?.length && !opts.allPages) {
      console.log(
        `Audit pages (default): ${pages.map((p) => p.path).join(', ')} — use --all-pages for full site`,
      );
    }



    const rawDir = path.join(runDir, 'raw');



    if (opts.stages.has('ci-gate') && !opts.skipCiGate) {

      console.log('Stage: ci-gate');

      try {

        const ci = await runCiGate({ onProgress: logProgress, signal: abort.signal });

        summary.ciGate = ci;

        if (!ci.passed) {

          failure = {

            stage: 'ci-gate',

            message: 'CI gate failed (see summary.ciGate.commands outputTail)',

          };

          failureRef.current = failure;

          console.error('CI gate failed');

          exitCodeRef.current = 1;

          if (!opts.continueOnFail) return exitCodeRef.current;

        }

      } catch (err) {

        if (noteUserAbort(err, failureRef, exitCodeRef)) return exitCodeRef.current;

        failure = stageError('ci-gate', err);

        failureRef.current = failure;

        exitCodeRef.current = 1;

        console.error(failure.message);

        if (!opts.continueOnFail) return exitCodeRef.current;

      }

    }



    if (shouldRunDockerSmoke({ target: opts.target, stages: opts.stages, profiles: profileList })) {

      console.log('Stage: docker-smoke');

      try {

        const dockerSmoke = runDockerSmoke({

          profiles: profileList,

          baseUrl,

          onProgress: logProgress,

          signal: abort.signal,

        });

        summary.dockerSmoke = dockerSmoke;

        if (!dockerSmoke.passed) {

          failure = {

            stage: 'docker-smoke',

            message: formatDockerSmokeFailure(dockerSmoke),

          };

          failureRef.current = failure;

          console.error(failure.message);

          exitCodeRef.current = 1;

          if (!opts.continueOnFail) return exitCodeRef.current;

        }

      } catch (err) {

        if (noteUserAbort(err, failureRef, exitCodeRef)) return exitCodeRef.current;

        failure = stageError('docker-smoke', err);

        failureRef.current = failure;

        exitCodeRef.current = 1;

        console.error(failure.message);

        if (!opts.continueOnFail) return exitCodeRef.current;

      }

    }



    if (opts.stages.has('lighthouse')) {

      console.log(`Stage: lighthouse (${pages.length} pages, ${opts.runs} runs)`);

      try {

        const lh = await runLighthouseStage({

          baseUrl,

          pages,

          runs: opts.runs,

          rawDir,

          includeMobileLowend: opts.level === 'full',

          onProgress: logProgress,

          signal: abort.signal,

        });

        summary.lighthouse = lh;

        benchmarkIndex = lh.benchmarkIndex;

        if (lh.aborted) {

          markAbortedStage(

            'Lighthouse',

            'partial page medians in summary.lighthouse',

            failureRef,

            exitCodeRef,

          );

          return exitCodeRef.current;

        }

      } catch (err) {

        if (noteUserAbort(err, failureRef, exitCodeRef)) return exitCodeRef.current;

        failure = stageError('lighthouse', err);

        failureRef.current = failure;

        exitCodeRef.current = 1;

        console.error(failure.message);

        if (!opts.continueOnFail) return exitCodeRef.current;

      }

    }



    if (opts.stages.has('seo')) {

      console.log('Stage: seo');

      try {

        const seo = await runSeoStage({

          pages,

          sitemapPaths,

          baseUrl,

          canonicalBaseUrl: opts.target === 'local' ? prodBaseUrl() : baseUrl,

          skipLinks: opts.level === 'quick',

          lighthousePages: (summary.lighthouse as { pages?: import('./stages/lighthouse.ts').LighthousePageMedian[] })
            ?.pages,

          onProgress: logProgress,

          signal: abort.signal,

        });

        summary.seo = seo;

        if (seo.aborted) {

          markAbortedStage('SEO', 'partial findings in summary.seo', failureRef, exitCodeRef);

          return exitCodeRef.current;

        }

      } catch (err) {

        if (noteUserAbort(err, failureRef, exitCodeRef)) return exitCodeRef.current;

        failure = stageError('seo', err);

        failureRef.current = failure;

        exitCodeRef.current = 1;

        console.error(failure.message);

        if (!opts.continueOnFail) return exitCodeRef.current;

      }

    }



    if (opts.stages.has('interaction')) {

      const ixPages = pagesForInteraction(pages);

      console.log(

        `Stage: interaction (${ixPages.length} pages, ${filterProfiles(getProfilesForLevel(opts.level), opts.profiles).length} profiles)`,

      );

      try {

        summary.interaction = await runInteractionStage({

          level: opts.level,

          pages: ixPages,

          baseUrl,

          profileIds: opts.profiles,

          trace: opts.trace,

          rawDir,

          onProgress: logProgress,

          signal: abort.signal,

          interactionJobTimeoutMs: opts.interactionJobTimeoutMs,

          interactionFullScenarios: opts.interactionFullScenarios,

        });

        const ix = summary.interaction as {

          profiles?: Array<{
            failed?: boolean;
            failureKind?: InteractionFailureKind;
            warning?: string;
          }>;

          aborted?: boolean;

        };

        if (ix.aborted) {

          markAbortedStage(

            'Interaction',

            'partial profile runs in summary.interaction',

            failureRef,

            exitCodeRef,

          );

          return exitCodeRef.current;

        }

        const hardIx = interactionHasHardFailures(ix.profiles ?? []);

        const softWarnings = (ix.profiles ?? []).filter((p) => p.warning || p.failureKind === 'tier');

        if (softWarnings.length) {

          console.warn(

            `Interaction: ${softWarnings.length} profile run(s) with tier warnings (non-fatal; see summary.interaction)`,

          );

        }

        if (hardIx) {

          failure = {

            stage: 'interaction',

            message: 'Interaction hard failures detected (crash/timeout/docker; see summary.interaction)',

          };

          failureRef.current = failure;

          console.error('Interaction hard failures detected');

          exitCodeRef.current = 1;

        }

      } catch (err) {

        if (noteUserAbort(err, failureRef, exitCodeRef)) return exitCodeRef.current;

        failure = stageError('interaction', err);

        failureRef.current = failure;

        exitCodeRef.current = 1;

        console.error(err);

        if (!opts.continueOnFail) return exitCodeRef.current;

      }

    }

  } catch (err) {
    if (!noteUserAbort(err, failureRef, exitCodeRef)) {
      const serialized = serializeAuditError(err);
      failure = { stage: serialized.stage, message: serialized.message, stack: serialized.stack };
      failureRef.current = failure;
      exitCodeRef.current = 1;
      console.error(err);
    }

  } finally {

    abort.dispose();

    previewStop?.();

    finalizeOnce();

  }



  return exitCodeRef.current;

}



const isDirectRun =

  process.argv[1] &&

  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));



if (isDirectRun) {

  runAudit(process.argv.slice(2))

    .then((code) => process.exit(code))

    .catch((err) => {

      console.error(err);

      process.exit(1);

    });

}



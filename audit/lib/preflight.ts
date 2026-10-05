import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from '@playwright/test';
import type { AuditProfile } from '../config/profiles.ts';
import { isDockerAvailable } from './docker.ts';
import { needsPreviewServer } from './server.ts';
import {
  applyPlaywrightEnvForAudit,
  PLAYWRIGHT_INSTALL_CMD,
  stripCursorPlaywrightBrowsersPath,
} from './playwright-env.ts';

type AuditTarget = 'local' | 'prod';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MIN_NODE = [22, 12, 0] as const;

export { PLAYWRIGHT_INSTALL_CMD };

export interface PreflightCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface PreflightResult {
  passed: boolean;
  checks: PreflightCheck[];
  playwright?: {
    strippedSandboxBrowsersPath: boolean;
    browsersPath?: string;
    installCommand: string;
  };
}

function nodeVersionAtLeast(version: string, min: readonly [number, number, number]): boolean {
  const parts = version.replace(/^v/, '').split('.').map((n) => Number(n) || 0);
  const [major, minor, patch] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  const [minMajor, minMinor, minPatch] = min;
  if (major !== minMajor) return major > minMajor;
  if (minor !== minMinor) return minor > minMinor;
  return patch >= minPatch;
}

/** Host Playwright browsers required for the selected stages (Docker profiles use the audit image). */
export function hostBrowsersForAudit(options: {
  stages: Set<string>;
  skipCiGate: boolean;
  profiles: AuditProfile[];
}): Set<'chromium' | 'webkit'> {
  const browsers = new Set<'chromium' | 'webkit'>();
  const needsCiPlaywright = options.stages.has('ci-gate') && !options.skipCiGate;
  const needsInteraction = options.stages.has('interaction');

  if (needsCiPlaywright) browsers.add('chromium');

  if (needsInteraction) {
    for (const profile of options.profiles) {
      if (!profile.docker) browsers.add(profile.browser);
    }
  }

  return browsers;
}

function needsLocalDist(stages: Set<string>, skipCiGate: boolean, target: AuditTarget): boolean {
  if (target !== 'local') return false;
  if (stages.has('seo')) return true;
  if (needsPreviewServer(stages)) return true;
  if (stages.has('ci-gate') && !skipCiGate) return false;
  return false;
}

function playwrightCliPath(): string {
  return path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
}

function browsersMissingFromDisk(browsers: Iterable<'chromium' | 'webkit'>): ('chromium' | 'webkit')[] {
  const missing: ('chromium' | 'webkit')[] = [];
  for (const browser of browsers) {
    const launcher = browser === 'chromium' ? chromium : webkit;
    if (!fs.existsSync(launcher.executablePath())) {
      missing.push(browser);
    }
  }
  return missing;
}

/** Download browsers into the default ms-playwright cache (audit strips Cursor sandbox path first). */
function installPlaywrightBrowsers(
  browsers: readonly ('chromium' | 'webkit')[],
  onProgress?: (msg: string) => void,
): void {
  if (browsers.length === 0) return;
  onProgress?.(
    `Preflight: installing missing Playwright browsers (${browsers.join(', ')}) — required for full audit interaction`,
  );
  execFileSync(
    process.execPath,
    [playwrightCliPath(), 'install', ...browsers],
    {
      cwd: root,
      stdio: 'inherit',
      env: stripCursorPlaywrightBrowsersPath(process.env),
    },
  );
}

async function smokeLaunchBrowser(
  browser: 'chromium' | 'webkit',
): Promise<{ ok: boolean; executable: string; detail: string }> {
  const launcher = browser === 'chromium' ? chromium : webkit;
  const executable = launcher.executablePath();
  try {
    const instance = await launcher.launch({ headless: true });
    await instance.close();
    return { ok: true, executable, detail: executable };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      executable,
      detail: `${message}\nExpected binary: ${executable}`,
    };
  }
}

export async function runPreflight(options: {
  stages: Set<string>;
  skipCiGate: boolean;
  target: AuditTarget;
  profiles: AuditProfile[];
  onProgress?: (msg: string) => void;
}): Promise<PreflightResult> {
  const strippedSandboxBrowsersPath = applyPlaywrightEnvForAudit();
  const onProgress = options.onProgress;
  const checks: PreflightCheck[] = [];

  onProgress?.('Preflight: checking Node.js version');
  if (nodeVersionAtLeast(process.version, MIN_NODE)) {
    checks.push({ name: 'node', ok: true, detail: process.version });
  } else {
    checks.push({
      name: 'node',
      ok: false,
      detail: `Need Node >= ${MIN_NODE.join('.')}, got ${process.version}. Run npm ci after switching Node.`,
    });
  }

  if (strippedSandboxBrowsersPath) {
    onProgress?.(
      'Preflight: cleared Cursor sandbox PLAYWRIGHT_BROWSERS_PATH (using default ms-playwright cache)',
    );
  }

  const distIndex = path.join(root, 'dist', 'index.html');
  if (needsLocalDist(options.stages, options.skipCiGate, options.target)) {
    onProgress?.('Preflight: checking dist/ (required when CI gate is skipped)');
    const ok = fs.existsSync(distIndex);
    checks.push({
      name: 'dist',
      ok,
      detail: ok
        ? distIndex
        : `Missing ${distIndex}. Run: npm run build (or include ci-gate without --skip-ci-gate).`,
    });
  }

  const needsDocker = options.profiles.some((p) => p.docker);
  if (needsDocker) {
    onProgress?.('Preflight: checking Docker (required for Docker interaction profiles)');
    const ok = isDockerAvailable();
    checks.push({
      name: 'docker',
      ok,
      detail: ok
        ? 'docker info OK'
        : 'Docker is required for full audit Docker profiles but `docker info` failed. Install Docker Desktop (WSL2 on Windows).',
    });
  }

  const browsers = hostBrowsersForAudit(options);
  if (browsers.size > 0) {
    const missing = browsersMissingFromDisk(browsers);
    let browserInstallOk = true;
    if (missing.length > 0) {
      try {
        installPlaywrightBrowsers(missing, onProgress);
      } catch (err) {
        browserInstallOk = false;
        const message = err instanceof Error ? err.message : String(err);
        checks.push({
          name: 'playwright-install',
          ok: false,
          detail: `${message}\nManual fix: ${PLAYWRIGHT_INSTALL_CMD}`,
        });
      }
    }

    if (browserInstallOk) {
      onProgress?.(
        `Preflight: smoke-launching Playwright (${[...browsers].join(', ')}) — fails fast before long stages`,
      );
      for (const browser of browsers) {
        const result = await smokeLaunchBrowser(browser);
        checks.push({
          name: `playwright-${browser}`,
          ok: result.ok,
          detail: result.detail,
        });
        if (!result.ok) {
          onProgress?.(`Preflight: ${browser} launch failed (see summary after run)`);
        }
      }
    }
  }

  const passed = checks.every((c) => c.ok);
  return {
    passed,
    checks,
    playwright:
      browsers.size > 0
        ? {
            strippedSandboxBrowsersPath,
            browsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH,
            installCommand: PLAYWRIGHT_INSTALL_CMD,
          }
        : undefined,
  };
}

export function formatPreflightFailure(result: PreflightResult): string {
  const failed = result.checks.filter((c) => !c.ok);
  const lines = failed.map((c) => `- ${c.name}: ${c.detail.split('\n')[0]}`);
  if (result.playwright && failed.some((c) => c.name.startsWith('playwright-'))) {
    lines.push(`Install browsers: ${result.playwright.installCommand}`);
  }
  return `Audit preflight failed:\n${lines.join('\n')}`;
}

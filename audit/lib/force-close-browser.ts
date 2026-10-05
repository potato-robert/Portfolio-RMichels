import type { ChildProcess } from 'node:child_process';
import type { Browser, BrowserContext } from '@playwright/test';

/** Chromium exposes `process()` at runtime; it is not on Playwright's public `Browser` type. */
type BrowserWithOptionalProcess = Browser & {
  process?: () => ChildProcess | null;
};

export async function forceClosePlaywright(
  context: BrowserContext | null | undefined,
  browser: Browser | null | undefined,
  opts?: { killMs?: number },
): Promise<void> {
  const killMs = opts?.killMs ?? 5_000;
  await Promise.race([
    (async () => {
      await context?.close().catch(() => {});
      await browser?.close().catch(() => {});
      const proc = (browser as BrowserWithOptionalProcess | null | undefined)?.process?.();
      if (proc && !proc.killed) {
        try {
          proc.kill('SIGKILL');
        } catch {
          // ignore
        }
      }
    })(),
    new Promise<void>((resolve) => setTimeout(resolve, killMs)),
  ]);
}

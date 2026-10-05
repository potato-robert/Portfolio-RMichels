const CURSOR_SANDBOX = 'cursor-sandbox-cache';

export const PLAYWRIGHT_INSTALL_CMD = 'npx playwright install --with-deps chromium webkit';

function isCursorSandboxBrowsersPath(browsersPath: string | undefined): boolean {
  return Boolean(browsersPath?.includes(CURSOR_SANDBOX));
}

/** Drop Cursor agent PLAYWRIGHT_BROWSERS_PATH so Playwright uses %LOCALAPPDATA%\\ms-playwright. */
export function stripCursorPlaywrightBrowsersPath(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const out = { ...env };
  if (isCursorSandboxBrowsersPath(out.PLAYWRIGHT_BROWSERS_PATH)) {
    delete out.PLAYWRIGHT_BROWSERS_PATH;
  }
  return out;
}

export function applyPlaywrightEnvForAudit(): boolean {
  if (isCursorSandboxBrowsersPath(process.env.PLAYWRIGHT_BROWSERS_PATH)) {
    delete process.env.PLAYWRIGHT_BROWSERS_PATH;
    return true;
  }
  return false;
}


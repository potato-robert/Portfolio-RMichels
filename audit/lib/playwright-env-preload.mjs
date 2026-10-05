/** Runs via `tsx --import` before Playwright modules load (see package.json audit scripts). Keep in sync with audit/lib/playwright-env.ts */
const CURSOR_SANDBOX = 'cursor-sandbox-cache';
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (browsersPath?.includes(CURSOR_SANDBOX)) {
  delete process.env.PLAYWRIGHT_BROWSERS_PATH;
}

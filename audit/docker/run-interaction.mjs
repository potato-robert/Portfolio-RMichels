/**
 * Docker-side interaction probe (Chromium + SwiftShader).
 * Args: <pagePath> <profileId>
 */
import { chromium } from 'playwright';

const baseUrl = process.env.AUDIT_BASE_URL ?? 'http://host.docker.internal:4321';
const pagePath = process.argv[2] ?? '/';
const profileId = process.argv[3] ?? 'docker';
const auditTier = process.env.AUDIT_TIER;

const params = new URLSearchParams({ perf: '1' });
if (auditTier) params.set('auditTier', auditTier);
const qs = params.toString();
const url =
  pagePath === '/'
    ? `${baseUrl.replace(/\/$/, '')}/?${qs}`
    : `${baseUrl.replace(/\/$/, '')}${pagePath}?${qs}`;

const waitUntil = 'load';

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--no-sandbox'],
});
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const page = await context.newPage();

await page.goto(url, { waitUntil, timeout: 120_000 });
await page.locator('body').waitFor({ state: 'visible', timeout: 30_000 });

const tier = await page.evaluate(() => document.body.dataset.perfTier ?? 'unknown');

console.log(JSON.stringify({ profileId, pagePath, tier, ok: true }));
await browser.close();

process.exit(0);

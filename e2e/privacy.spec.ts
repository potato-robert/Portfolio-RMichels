import { test, expect } from '@playwright/test';
import { blockExternalCdn } from '../playwright.config';

test.beforeEach(async ({ page }) => {
  await blockExternalCdn(page);
});

test.describe('privacy and embeds', () => {
  test('no cookie banner on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#CookieConsent')).toHaveCount(0);
  });

  test('no site cookies after browsing core pages', async ({ page, context }) => {
    await page.goto('/');
    await page.goto('/projects');
    await page.goto('/pavilions');
    const cookies = await context.cookies();
    const siteCookies = cookies.filter((c) =>
      ['rmCookieConsent', 'visitorFilter', '_ga'].includes(c.name),
    );
    expect(siteCookies).toHaveLength(0);
  });

  test('embed placeholder loads iframe on click', async ({ page }) => {
    await page.goto('/pavilions');
    const placeholder = page.locator('[data-external-embed]').first();
    await expect(placeholder).toBeVisible();
    await placeholder.locator('[data-embed-load]').click();
    await expect(placeholder.locator('iframe')).toHaveCount(1);
  });

  test('always load embedded content button persists all providers', async ({ page }) => {
    await page.goto('/pavilions');
    const placeholder = page.locator('[data-external-embed][data-provider="youtube"]').first();
    await placeholder.locator('[data-embed-load-all]').click();
    const stored = await page.evaluate(() => localStorage.getItem('rmExternalMedia'));
    expect(stored).toContain('"youtube":true');
    expect(stored).toContain('"clirio":true');
    await page.reload();
    await expect(page.locator('[data-external-embed][data-provider="youtube"]').first().locator('iframe')).toHaveCount(1);
  });

  test('German privacy page is in German', async ({ page }) => {
    await page.goto('/de/privacyPolicy');
    await expect(page.locator('section.privacy[lang="de"] h1')).toHaveText('Datenschutzerklärung');
  });

  test('privacy settings page renders controls', async ({ page }) => {
    await page.goto('/privacySettings');
    await expect(page.locator('section.privacy[lang="en"] h1')).toHaveText('Privacy settings');
    await expect(page.locator('#privacyAlwaysLoadEmbeds')).toBeVisible();
    await expect(page.locator('[data-embed-provider="youtube"]')).toBeVisible();
    await expect(page.locator('[data-embed-provider="clirio"]')).toBeVisible();
    await page.goto('/de/privacySettings');
    await expect(page.locator('section.privacy[lang="de"] h1')).toHaveText('Privacy-Einstellungen');
  });

  test('legal notice routes render', async ({ page }) => {
    await page.goto('/legalNotice');
    await expect(page.locator('h1')).toHaveText('Legal Notice');
    await page.goto('/de/legalNotice');
    await expect(page.locator('h1')).toHaveText('Impressum');
  });

  test('forget remembered embed on privacy choices', async ({ page }) => {
    await page.goto('/pavilions');
    const placeholder = page.locator('[data-external-embed][data-provider="youtube"]').first();
    await placeholder.locator('[data-embed-load-all]').click();
    await page.goto('/privacySettings');
    await page.locator('[data-embed-provider="youtube"]').uncheck();
    const stored = await page.evaluate(() => localStorage.getItem('rmExternalMedia'));
    expect(stored).not.toContain('"youtube":true');
    expect(stored).toContain('"clirio":true');
  });

  test('always load all embeds on privacy choices persists providers', async ({ page }) => {
    await page.goto('/privacySettings');
    await page.locator('#privacyAlwaysLoadEmbeds').check();
    const stored = await page.evaluate(() => localStorage.getItem('rmExternalMedia'));
    expect(stored).toContain('"youtube":true');
    expect(stored).toContain('"sketchfab":true');
    expect(stored).toContain('"figma":true');
    expect(stored).toContain('"clirio":true');
    await page.goto('/pavilions');
    await expect(
      page.locator('[data-external-embed][data-provider="youtube"]').first().locator('iframe'),
    ).toHaveCount(1);
  });

  test('uncheck always load all embeds clears storage', async ({ page }) => {
    await page.goto('/privacySettings');
    await page.locator('#privacyAlwaysLoadEmbeds').check();
    await page.locator('#privacyAlwaysLoadEmbeds').uncheck();
    const stored = await page.evaluate(() => localStorage.getItem('rmExternalMedia'));
    expect(stored).toBe('{}');
  });
});

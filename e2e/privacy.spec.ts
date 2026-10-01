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

  test('remember embed provider persists in localStorage', async ({ page }) => {
    await page.goto('/pavilions');
    const placeholder = page.locator('[data-external-embed][data-provider="youtube"]').first();
    await placeholder.locator('[data-embed-remember]').check();
    await placeholder.locator('[data-embed-load]').click();
    await page.reload();
    await expect(page.locator('[data-external-embed][data-provider="youtube"]').first().locator('iframe')).toHaveCount(1);
  });

  test('German privacy page is in German', async ({ page }) => {
    await page.goto('/de/privacyPolicy');
    await expect(page.locator('section.privacy[lang="de"] h1')).toHaveText('Datenschutzerklärung');
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
    await placeholder.locator('[data-embed-remember]').check();
    await placeholder.locator('[data-embed-load]').click();
    await page.goto('/privacyPolicy');
    await page.locator('[data-forget-embed="youtube"]').click();
    const stored = await page.evaluate(() => localStorage.getItem('rmExternalMedia'));
    expect(stored).toBe('{}');
  });
});

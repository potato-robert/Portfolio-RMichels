import { test, expect } from './fixtures';

test.describe('published project routing', () => {
  test('tourguide tile links to /tourguide', async ({ page }) => {
    await page.goto('/projects');

    const tourguideLink = page.locator('.projRow a[href="/tourguide"]');
    await expect(tourguideLink).toBeVisible();

    await tourguideLink.click();

    await expect(page).toHaveURL(/\/tourguide$/);
    await expect(page.locator('#projLanding h1')).toHaveText('Tourguide');
  });

  test('canfit tile links to /canfit', async ({ page }) => {
    await page.goto('/projects');

    const link = page.locator('.projRow a[href="/canfit"]');
    await expect(link).toBeVisible();

    await link.click();

    await expect(page).toHaveURL(/\/canfit$/);
    await expect(page.locator('#projLanding h1')).toHaveText('Canfit');
  });
});

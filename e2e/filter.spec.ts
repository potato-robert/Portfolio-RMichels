import { test, expect } from './fixtures';

test.describe('homepage filter session', () => {
  test('?filter=vr sets session filter and home link preserves it', async ({ page }) => {
    await page.goto('/?filter=vr');

    await page.waitForFunction(() => sessionStorage.getItem('rmVisitorFilter') === 'vr');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(3);

    await page.goto('/about');

    const homeLink = page.locator('a[data-home-link]').first();
    await expect(homeLink).toHaveAttribute('href', /\?filter=vr$/);
  });

  test('session filter persists on bare / and filters rows', async ({ page }) => {
    await page.goto('/?filter=vr');
    await page.waitForFunction(() => sessionStorage.getItem('rmVisitorFilter') === 'vr');

    await page.goto('/');

    const stored = await page.evaluate(() => sessionStorage.getItem('rmVisitorFilter'));
    expect(stored).toBe('vr');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(3);

    const homeLink = page.locator('a[data-home-link]').first();
    await expect(homeLink).toHaveAttribute('href', /\?filter=vr$/);
  });
});

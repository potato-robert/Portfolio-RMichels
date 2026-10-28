import { test, expect } from './fixtures';

test.describe('homepage stack filter', () => {
  test('filters only while ?filter= is in the URL', async ({ page }) => {
    await page.goto('/?filter=unity');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(4);
    const stored = await page.evaluate(() => sessionStorage.getItem('rmVisitorFilter'));
    expect(stored).toBeNull();

    await page.goto('/');
    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(6);

    await page.goto('/about');
    await expect(page.locator('header a[aria-label="Home"]')).toHaveAttribute('href', '/');
  });

  test('an unmatched filter shows the first six tiles', async ({ page }) => {
    await page.goto('/?filter=vr');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(6);
    await expect(page).not.toHaveURL(/filter=/);
    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden) h2').first()).toHaveText('Tourguide');
  });
});

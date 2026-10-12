import { test, expect } from './fixtures';
import { SITE_3D_STORAGE_KEY } from '../src/lib/site-3d';

test.describe('footer preferences', () => {
  test('site 3D toggle persists in localStorage and reloads', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#site3dToggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeChecked();

    await toggle.uncheck();
    await page.waitForURL('/');

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      SITE_3D_STORAGE_KEY,
    );
    expect(stored).toBe('false');
    await expect(toggle).not.toBeChecked();
  });
});

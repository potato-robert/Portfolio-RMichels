import { test, expect } from './fixtures';

test.describe('overlay menu', () => {
  test('opens, closes with Escape, and navigates', async ({ page }) => {
    await page.goto('/');

    const overlay = page.locator('#OverlayMenu');
    const toggle = page.locator('#MenuToggle');

    await expect(overlay).toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(overlay).not.toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(overlay).toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await page.locator('#MenuContent a[href="/projects"]').click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('returns focus to menu toggle after Escape', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#MenuToggle');
    await toggle.click();
    await page.keyboard.press('Escape');

    await expect(toggle).toBeFocused();
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#Content');
    await skipLink.focus();
    await expect(page.locator('#Content')).toBeVisible();
  });
});

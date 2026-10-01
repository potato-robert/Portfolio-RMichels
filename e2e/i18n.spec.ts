import { test, expect } from './fixtures';

test.describe('language toggle', () => {
  test('/de/projects loads and English toggle goes to /projects', async ({ page }) => {
    await page.goto('/de/projects');

    await expect(page.locator('#Projects h1')).toContainText('Projekte');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');

    await page.locator('#MenuToggle').click();
    await expect(page.locator('#OverlayMenu')).not.toHaveClass(/hidden/);

    await page.locator('.lang-toggle').click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('/about Deutsch navigates to /de/about with lang=de', async ({ page }) => {
    await page.goto('/about');

    await page.locator('#MenuToggle').click();
    await expect(page.locator('#OverlayMenu')).not.toHaveClass(/hidden/);

    await page.locator('.lang-toggle').click();

    await expect(page).toHaveURL(/\/de\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('#About')).toHaveText('Über Mich');
  });
});

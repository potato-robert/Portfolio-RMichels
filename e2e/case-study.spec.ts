import { test, expect } from './fixtures';
import { waitForLightboxClosed, waitForLightboxReady } from './lightbox-helpers';

test.describe('case study', () => {
  test('/futureEarth shows hero, meta, and gallery', async ({ page }) => {
    await page.goto('/futureEarth');

    await expect(page.locator('#projLanding h1')).toHaveText('Future Earth');
    await expect(page.locator('#projMeta')).toBeVisible();
    await expect(page.locator('#projMeta')).toContainText('Type');
    await expect(page.locator('#projMeta')).toContainText('2020');
    const galleryImages = page.locator('#projContent .sectionMedia figure img');
    await expect(galleryImages).not.toHaveCount(0);

    const firstImage = galleryImages.first();
    await firstImage.scrollIntoViewIfNeeded();
    await firstImage.click();

    const lightbox = page.locator('.pswp');
    await expect(lightbox).toBeVisible();
    await waitForLightboxReady(page);

    await page.keyboard.press('Escape');
    await waitForLightboxClosed(page);
    await expect(lightbox).toHaveCount(0);
  });

  test('/futureEarth lightbox navigates with arrow keys', async ({ page }) => {
    await page.goto('/futureEarth');

    const galleryImages = page.locator('#projContent .sectionMedia figure img');
    await expect(galleryImages).not.toHaveCount(0);

    await galleryImages.first().click();
    await waitForLightboxReady(page);

    const indexBefore = await page.evaluate(
      () => (window as Window & { pswp?: { currIndex?: number } }).pswp?.currIndex ?? -1,
    );

    await page.keyboard.press('ArrowRight');
    await waitForLightboxReady(page);

    const indexAfter = await page.evaluate(
      () => (window as Window & { pswp?: { currIndex?: number } }).pswp?.currIndex ?? -1,
    );
    expect(indexAfter).toBe(indexBefore + 1);

    await page.keyboard.press('Escape');
    await waitForLightboxClosed(page);
  });

  test('/de/futureEarth shows German project type meta', async ({ page }) => {
    await page.goto('/de/futureEarth');

    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('#projMeta')).toContainText('VR-Spiel');
  });

  test.describe('project TOC', () => {
    test('shows section links on wide viewports', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/clirioScanViews');

      const toc = page.locator('#projToc');
      await expect(toc).toHaveClass(/is-enabled/, { timeout: 10000 });
      await expect(toc).not.toHaveAttribute('hidden', '');

      const links = toc.locator('[data-toc-link]');
      await expect(links).toHaveCount(3);
      await expect(links.nth(0)).toHaveText('Overview');
      await expect(links.nth(1)).toHaveText('Development');
      await expect(links.nth(2)).toHaveText('Challenges');
    });

    test('clicking a TOC link scrolls to the section', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/clirioScanViews');

      const toc = page.locator('#projToc');
      await expect(toc).toHaveClass(/is-enabled/, { timeout: 10000 });

      const developmentLink = toc.locator('[data-toc-link][href="#development"]');
      await developmentLink.evaluate((el) => (el as HTMLAnchorElement).click());

      await expect(page.locator('#development')).toBeInViewport();
      await expect(developmentLink).toHaveClass(/is-active/);
    });

    test('highlights nested mockup overview heading on tourguide', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/tourguide');

      const toc = page.locator('#projToc');
      await expect(toc).toHaveClass(/is-enabled/, { timeout: 10000 });

      const overviewLink = toc.locator('[data-toc-link][href="#overview"]');
      await expect(overviewLink).toHaveClass(/is-active/);

      const firstTargetId = await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>(
          '#projContent .sectionText h2[id], #projContent .sectionText h3[id]',
        );
        return el?.id ?? null;
      });
      expect(firstTargetId).toBe('overview');
    });

    test('hides TOC on narrow viewports', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      await page.goto('/clirioScanViews');

      const toc = page.locator('#projToc');
      await expect(toc).toHaveAttribute('hidden', '');
      await expect(toc).not.toHaveClass(/is-enabled/);
    });

    test('DE route uses localized aria-label', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/de/clirioScanViews');

      const toc = page.locator('#projToc');
      await expect(toc).toHaveClass(/is-enabled/, { timeout: 10000 });
      await expect(toc).toHaveAttribute('aria-label', 'Auf dieser Seite');
    });
  });
});

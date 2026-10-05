import { test, expect } from './fixtures';

test.describe('Responsive images', () => {
  test('homepage tiles use picture/srcset without legacy lqip URLs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const tilePictures = page.locator('#MyWork .projRow:not(.projRow--hidden) picture');
    const count = await tilePictures.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);

    for (let i = 0; i < count; i++) {
      const picture = tilePictures.nth(i);
      await expect(picture.locator('source[type="image/avif"]')).toHaveAttribute('srcset', /.+/);
      await expect(picture.locator('img')).toHaveAttribute('width', /.+/);
      await expect(picture.locator('img')).toHaveAttribute('height', /.+/);
      const src = await picture.locator('img').getAttribute('src');
      expect(src ?? '').not.toMatch(/\/lqip\//);
    }
  });
});

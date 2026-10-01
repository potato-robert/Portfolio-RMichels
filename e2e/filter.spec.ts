import { test, expect } from './fixtures';

test.describe('homepage filter cookie', () => {
  test('?filter=vr sets visitorFilter cookie and home link preserves it', async ({ page, context }) => {
    await page.goto('/?filter=vr');

    await page.waitForFunction(() => document.cookie.includes('visitorFilter=vr'));

    const cookies = await context.cookies();
    const visitorFilter = cookies.find((c) => c.name === 'visitorFilter');
    expect(visitorFilter?.value).toBe('vr');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(3);

    await page.goto('/about');

    const homeLink = page.locator('a[data-home-link]').first();
    await expect(homeLink).toHaveAttribute('href', /\?filter=vr$/);
  });

  test('visitorFilter persists on bare / and filters rows from cookie', async ({ page, context }) => {
    await page.goto('/?filter=vr');
    await page.waitForFunction(() => document.cookie.includes('visitorFilter=vr'));

    await page.goto('/');

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'visitorFilter')?.value).toBe('vr');

    await expect(page.locator('#MyWork .projRow:not(.projRow--hidden)')).toHaveCount(3);

    const homeLink = page.locator('a[data-home-link]').first();
    await expect(homeLink).toHaveAttribute('href', /\?filter=vr$/);
  });
});

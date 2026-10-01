import { test, expect } from './fixtures';

test.describe('projects page filter', () => {
  test('OR logic updates projectCount and URL filter pre-selects buttons', async ({ page }) => {
    await page.goto('/projects');

    const projectCount = page.locator('#projectCount');
    const initialCount = Number(await projectCount.textContent());
    expect(initialCount).toBeGreaterThan(0);

    const vrBtn = page.locator('.filterBtn[data-js="vr"]');
    const frontEndBtn = page.locator('.filterBtn[data-js="front-end"]');

    await vrBtn.click();
    await expect(vrBtn).toHaveClass(/filterBtn--selected/);
    const vrOnlyCount = Number(await projectCount.textContent());
    expect(vrOnlyCount).toBe(3);

    await frontEndBtn.click();
    await expect(frontEndBtn).toHaveClass(/filterBtn--selected/);
    const orCount = Number(await projectCount.textContent());
    expect(orCount).toBeGreaterThan(1);
    expect(orCount).toBeGreaterThanOrEqual(vrOnlyCount);

    await page.goto('/projects?filter=vr');
    await expect(page.locator('.filterBtn[data-js="vr"]')).toHaveClass(/filterBtn--selected/);
    await expect(projectCount).toHaveText(String(vrOnlyCount));
  });

  test('?filter=vr,front-end applies OR in one pass', async ({ page, context }) => {
    await page.goto('/projects?filter=vr,front-end');

    await expect(page.locator('.filterBtn[data-js="vr"]')).toHaveClass(/filterBtn--selected/);
    await expect(page.locator('.filterBtn[data-js="front-end"]')).toHaveClass(/filterBtn--selected/);

    const projectCount = page.locator('#projectCount');
    const orFromUrl = Number(await projectCount.textContent());
    expect(orFromUrl).toBeGreaterThan(1);

    const stored = await page.evaluate(() => sessionStorage.getItem('rmVisitorFilter'));
    expect(stored).toBe('vr,front-end');
  });
});

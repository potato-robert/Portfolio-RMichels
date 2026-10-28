import { test, expect } from './fixtures';

test.describe('projects page stack filter', () => {
  test('selects one stack at a time and writes it to the URL', async ({ page }) => {
    await page.goto('/projects');

    const projectCount = page.locator('#projectCount');
    const initialCount = Number(await projectCount.textContent());
    expect(initialCount).toBeGreaterThan(0);

    const unityBtn = page.locator('.filterBtn[data-js="unity"]');
    const csharpBtn = page.locator('.filterBtn[data-js="csharp"]');

    await unityBtn.click();
    await expect(unityBtn).toHaveClass(/filterBtn--selected/);
    await expect(page).toHaveURL(/\/projects\?filter=unity$/);
    await expect(projectCount).toHaveText('4');

    await csharpBtn.click();
    await expect(csharpBtn).toHaveClass(/filterBtn--selected/);
    await expect(unityBtn).not.toHaveClass(/filterBtn--selected/);
    await expect(page).toHaveURL(/\/projects\?filter=csharp$/);
    await expect(projectCount).toHaveText('5');

    await csharpBtn.click();
    await expect(csharpBtn).not.toHaveClass(/filterBtn--selected/);
    await expect(page).toHaveURL(/\/projects$/);
    await expect(projectCount).toHaveText(String(initialCount));

    const stored = await page.evaluate(() => sessionStorage.getItem('rmVisitorFilter'));
    expect(stored).toBeNull();
  });

  test('?filter=unity pre-selects that button only', async ({ page }) => {
    await page.goto('/projects?filter=unity');

    await expect(page.locator('.filterBtn[data-js="unity"]')).toHaveClass(/filterBtn--selected/);
    await expect(page.locator('.filterBtn.filterBtn--selected')).toHaveCount(1);
    await expect(page.locator('#projectCount')).toHaveText('4');
  });

  test('an unmatched filter shows every project and selects no button', async ({ page }) => {
    await page.goto('/projects');
    const initialCount = await page.locator('#projectCount').textContent();

    await page.goto('/projects?filter=vr,front-end');

    await expect(page.locator('.filterBtn.filterBtn--selected')).toHaveCount(0);
    await expect(page.locator('#projectCount')).toHaveText(initialCount ?? '');
    await expect(page).not.toHaveURL(/filter=/);
  });
});

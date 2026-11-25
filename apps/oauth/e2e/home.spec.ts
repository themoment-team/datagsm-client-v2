import { expect, test } from '@playwright/test';

test('home renders heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'DataGSM OAuth' })).toBeVisible();
});

test('home에 공통 배경이 장식으로 깔린다', async ({ page }) => {
  await page.goto('/');

  const background = page.locator('canvas[aria-hidden="true"]');
  await expect(background).toHaveCount(1);
  await expect(background).toHaveCSS('position', 'fixed');
  await expect(background).toHaveCSS('pointer-events', 'none');
});

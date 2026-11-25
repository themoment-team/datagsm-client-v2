import { expect, test } from '@playwright/test';

test('home renders heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'DataGSM OAuth' })).toBeVisible();
});

test('home에 공통 배경이 장식으로 깔린다', async ({ page }) => {
  await page.goto('/');

  // 배경 레이어(aria-hidden div) 안에 WebGL canvas가 하나 그려진다.
  const background = page.locator('[aria-hidden="true"]:has(> canvas)');
  await expect(background).toHaveCount(1);
  await expect(background.locator('canvas')).toHaveCount(1);
  await expect(background).toHaveCSS('position', 'fixed');
  await expect(background).toHaveCSS('pointer-events', 'none');
});

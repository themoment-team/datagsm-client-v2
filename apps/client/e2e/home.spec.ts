import { expect, test } from '@playwright/test';

test('home renders heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'DataGSM Client' })).toBeVisible();
});

test('랜딩(/)에는 사이드바와 공통 배경이 없다', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'DataGSM Client' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('랜딩 밖의 화면에는 사이드바와 공통 배경이 깔린다', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');

  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible();
  // 배경 레이어(aria-hidden div) 안에 WebGL canvas가 하나 그려진다.
  const background = page.locator('[aria-hidden="true"]:has(> canvas)');
  await expect(background).toHaveCount(1);
  await expect(background.locator('canvas')).toHaveCount(1);
  await expect(background).toHaveCSS('position', 'fixed');
  await expect(background).toHaveCSS('pointer-events', 'none');
});

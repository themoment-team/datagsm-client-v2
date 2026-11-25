import { expect, test } from '@playwright/test';

// 테마는 앱끼리 공유하는 theme 쿠키에 있다. 인라인 스크립트가 그리기 전에 <html data-theme>을 맞추므로
// HTML을 받은 직후(domcontentloaded)에 이미 테마가 적용되어 있어야 깜빡임이 없다.
test('theme 쿠키가 없으면 Light로 연다', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('다른 앱이 저장한 theme 쿠키(dark)로 처음부터 Dark를 연다', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: 'theme', value: 'dark', url: baseURL ?? 'http://localhost:3000' },
  ]);

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(32, 34, 37)');
});

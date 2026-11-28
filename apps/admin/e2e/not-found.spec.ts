import { expect, test } from '@playwright/test';

test('존재하지 않는 경로는 사이드바가 있는 404와 학생 관리로 이동 버튼을 반환한다', async ({
  page,
}) => {
  const response = await page.goto('/this-page-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeVisible();
  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible();
  await expect(page.getByRole('link', { name: '학생 관리로 이동' })).toHaveAttribute(
    'href',
    '/students',
  );
});

test('이전 페이지는 직전 화면으로 돌아간다', async ({ page }) => {
  await page.goto('/');
  await page.goto('/this-page-does-not-exist');

  await page.getByRole('link', { name: '이전 페이지' }).click();

  await expect(page).toHaveURL('/');
});

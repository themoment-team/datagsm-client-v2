import { expect, test } from '@playwright/test';

// 관리자 웹은 core의 공용 틀(AppShell)에 관리자 메뉴를 넘긴다. 메뉴는 모두 이 앱 안 경로다.
test('관리자 사이드바가 관리자 배지와 관리자 메뉴를 보여 준다', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('관리자', { exact: true })).toBeVisible();

  const nav = page.getByRole('navigation', { name: '주 메뉴' });

  await expect(nav.getByRole('link')).toHaveText([
    '학생 관리',
    '계정 관리',
    '선생님 승인',
    '동아리 관리',
    '프로젝트 관리',
    'API 키 관리',
  ]);
  await expect(nav.getByRole('link', { name: '프로젝트 관리' })).toHaveAttribute(
    'href',
    '/projects',
  );
  await expect(
    page.getByRole('navigation', { name: '계정 메뉴' }).getByRole('link', { name: '로그아웃' }),
  ).toHaveAttribute('href', '/logout');
});

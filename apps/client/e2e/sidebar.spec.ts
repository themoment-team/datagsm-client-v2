import { expect, test } from '@playwright/test';

// 사이드바는 core의 공용 위젯이다. 이 앱 메뉴는 앱 안 경로로, 다른 앱 메뉴는 환경 변수의 앱 주소로 이동해야 한다.
test('사이드바가 앱 안 메뉴와 다른 앱 메뉴를 각각 올바른 주소로 연결한다', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: '주 메뉴' });

  await expect(nav.getByRole('link', { name: 'API 키' })).toHaveAttribute('href', '/api-keys');
  await expect(nav.getByRole('link', { name: '문서' })).toHaveAttribute(
    'href',
    'http://localhost:3002',
  );
  await expect(nav.getByRole('link', { name: '서비스 상태' })).toHaveAttribute(
    'href',
    'http://localhost:3003',
  );
  await expect(nav.getByRole('link', { name: '프로젝트' })).toHaveAttribute(
    'href',
    'http://localhost:3005',
  );
});

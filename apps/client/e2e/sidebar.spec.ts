import { expect, test } from '@playwright/test';

// 사이드바는 core의 공용 위젯이다. 이 앱 메뉴는 앱 안 경로로, 다른 앱 메뉴는 환경 변수의 앱 주소로 이동해야 한다.
// 랜딩(/)에는 사이드바가 없다. 백엔드 없이 열리는 사이드바 화면이 아직 404뿐이라 없는 주소로 확인한다.
// 그래서 이 테스트는 404 화면(app/not-found.tsx)에 기대고 있다. 404를 바꾸거나 백엔드 없이 열리는 페이지가 생기면 그 주소로 옮긴다.
const SHELL_PAGE = '/this-page-does-not-exist';
test('사이드바가 앱 안 메뉴와 다른 앱 메뉴를 각각 올바른 주소로 연결한다', async ({ page }) => {
  await page.goto(SHELL_PAGE);

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

test('계정 메뉴의 로그아웃은 POST /api/logout을 제출하는 버튼이다', async ({ page }) => {
  await page.goto(SHELL_PAGE);

  await expect(
    page.getByRole('navigation', { name: '계정 메뉴' }).getByRole('button', { name: '로그아웃' }),
  ).toBeVisible();
  await expect(page.locator('form[action="/api/logout"][method="post"]')).toHaveCount(1);
});

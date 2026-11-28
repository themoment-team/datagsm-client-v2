import { expect, test } from '@playwright/test';

import { signIn } from './signIn';

// 없는 주소는 경로로 나뉜다. 콘솔 메뉴 경로 아래는 사이드바 404, 그 밖은 사이드바 없는 카드 404다.
const LANDING_MISSING = '/this-page-does-not-exist';
const CONSOLE_MISSING = '/applications/this-page-does-not-exist';

// 스크립트(RSC 데이터)를 뺀 서버 HTML이다. 브라우저가 스크립트를 실행하기 전에 보이는 화면을 확인한다.
const serverMarkup = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '');

test('콘솔 밖의 없는 주소는 사이드바 없는 카드 404를 서버 HTML로 반환한다', async ({
  page,
  request,
}) => {
  const html = serverMarkup(await (await request.get(LANDING_MISSING)).text());
  expect(html).toContain('DataGSM으로 이동');
  expect(html).not.toContain('<nav');

  const response = await page.goto(LANDING_MISSING);

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeVisible();
  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'DataGSM으로 이동' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toHaveCount(0);
  // 사이드바는 없어도 공통 배경(WebGL canvas)은 하나 깔린다.
  await expect(page.locator('[aria-hidden="true"]:has(> canvas)')).toHaveCount(1);
});

test('로그인하지 않으면 콘솔 경로의 없는 주소도 먼저 로그인으로 보낸다', async ({ request }) => {
  const response = await request.get(CONSOLE_MISSING, { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toContain('/api/login?returnTo=');
});

test('로그인하면 콘솔 경로의 없는 주소는 사이드바가 있는 404를 보여 준다', async ({
  page,
  context,
  baseURL,
}) => {
  await signIn(context, baseURL);

  const response = await page.goto(CONSOLE_MISSING);

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible();
  await expect(page.getByRole('link', { name: '애플리케이션으로 이동' })).toHaveAttribute(
    'href',
    '/applications',
  );
});

test('콘솔 404도 요청한 주소에 맞는 화면을 서버 HTML로 반환한다', async ({ request }) => {
  const html = serverMarkup(
    await (await request.get(CONSOLE_MISSING, { headers: { cookie: 'datagsm_at=e2e' } })).text(),
  );

  expect(html).toContain('<nav');
  expect(html).toContain('애플리케이션으로 이동');
  expect(html).not.toContain('DataGSM으로 이동');
});

// 기록이 없을 때 애플리케이션으로 가는 경우는 단위 테스트(core NotFound.test.tsx)가 맡는다.
// Playwright의 새 페이지는 about:blank 기록을 하나 갖고 시작해서 기록이 없는 상태를 만들 수 없다.
test('이전 페이지는 직전 화면으로 돌아간다', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL);

  await page.goto('/');
  await page.goto(CONSOLE_MISSING);
  await page.getByRole('link', { name: '이전 페이지' }).click();

  await expect(page).toHaveURL('/');
});

test('로그인한 상태에서도 랜딩은 콘솔로 이동하지 않고 열린다', async ({
  page,
  context,
  baseURL,
}) => {
  await signIn(context, baseURL);

  await page.goto('/');

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: 'DataGSM Client' })).toBeVisible();
});

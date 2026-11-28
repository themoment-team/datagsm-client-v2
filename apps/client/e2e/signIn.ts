import type { BrowserContext } from '@playwright/test';

// 콘솔 경로는 proxy.ts가 access token 쿠키가 있는지만 보고 통과시킨다. 토큰 검증은 백엔드가 하므로,
// 백엔드를 부르지 않는 화면(404 등)은 아무 값이나 넣은 쿠키로 로그인한 상태를 흉내 낼 수 있다.
// 쿠키 이름은 core shared/auth/cookies.ts의 ACCESS_TOKEN_COOKIE다.
export const signIn = (context: BrowserContext, baseURL: string | undefined) =>
  context.addCookies([
    { name: 'datagsm_at', value: 'e2e', url: baseURL ?? 'http://localhost:3000', httpOnly: true },
  ]);

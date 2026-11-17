import type { NextRequest, NextResponse } from 'next/server';

import type { OauthTokens } from './oauth';

// 모두 이 앱 도메인에만 저장하는 httpOnly 쿠키다(host-only). 다른 서브도메인 앱과 공유하지 않는다.
export const ACCESS_TOKEN_COOKIE = 'datagsm_at';
export const REFRESH_TOKEN_COOKIE = 'datagsm_rt';
// 로그인 시작부터 콜백까지 state·PKCE verifier·돌아갈 경로를 담아 두는 임시 쿠키다.
export const LOGIN_FLOW_COOKIE = 'datagsm_login';

export const LOGIN_PATH = '/api/login';
export const CALLBACK_PATH = '/api/callback';

// access token 쿠키는 실제 만료보다 60초 먼저 사라지게 둔다.
// 쿠키가 없고 refresh token이 있으면 proxy가 갱신하므로, 만료된 토큰이 백엔드에 닿지 않는다.
const ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS = 60;
// refresh token 수명(30일)이다. token 응답에 수명이 없어 문서 값을 쓴다.
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const cookieOptions = (request: NextRequest, maxAge: number, path = '/') => ({
  httpOnly: true,
  secure: request.nextUrl.protocol === 'https:',
  sameSite: 'lax' as const,
  path,
  maxAge,
});

export const setTokenCookies = (
  request: NextRequest,
  response: NextResponse,
  tokens: OauthTokens,
) => {
  const accessMaxAge = Math.max(tokens.expiresIn - ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS, 0);

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(request, accessMaxAge),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(request, REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
};

export const clearTokenCookies = (response: NextResponse) => {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
};

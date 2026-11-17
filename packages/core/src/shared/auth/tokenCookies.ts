import type { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from './authCookies';
import type { OauthTokens } from './oauthClient';

const baseOptions = (secure: boolean) =>
  ({ httpOnly: true, secure, sameSite: 'lax', path: '/' }) as const;

export const accessTokenMaxAge = (expiresIn: number) =>
  Math.max(expiresIn - ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS, 0);

// 로그인 콜백과 proxy의 갱신이 같은 규칙으로 쿠키를 쓴다.
export const setTokenCookies = (response: NextResponse, tokens: OauthTokens, secure: boolean) => {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(secure),
    maxAge: accessTokenMaxAge(tokens.expiresIn),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(secure),
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
};

export const clearTokenCookies = (response: NextResponse) => {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
};

import { type NextRequest, NextResponse } from 'next/server';

import type { AppEnv, OauthEnv } from '@datagsm/core/shared/config';

import {
  ACCESS_TOKEN_COOKIE,
  clearTokenCookies,
  LOGIN_PATH,
  REFRESH_TOKEN_COOKIE,
  setTokenCookies,
} from './cookies';
import { OauthTokenError, type OauthTokens, refreshTokens } from './oauth';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// 앱의 proxy.ts가 내보낸다. 어떤 페이지가 로그인을 요구하는지는 앱의 matcher가 정한다.
// 1. access token 쿠키가 없고 refresh token이 있으면 먼저 갱신한다.
// 2. /backend/*는 토큰을 Authorization 헤더에 담아 API 서버로 넘긴다.
// 3. 그 밖에 matcher에 걸린 페이지는 토큰이 없으면 로그인으로 보낸다.
export const createAuthProxy =
  (env: OauthEnv & Pick<AppEnv, 'API_BASE_URL'>) => async (request: NextRequest) => {
    const { pathname, search, origin } = request.nextUrl;
    const isBackend = pathname.startsWith('/backend/');

    // 쿠키는 브라우저가 자동으로 보내므로, 상태를 바꾸는 요청은 다른 사이트에서 온 것을 막는다(CSRF).
    const requestOrigin = request.headers.get('origin');

    if (
      isBackend &&
      !SAFE_METHODS.has(request.method) &&
      requestOrigin !== null &&
      requestOrigin !== origin
    ) {
      return new NextResponse(null, { status: 403 });
    }

    let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    let refreshed: OauthTokens | null = null;
    let refreshRejected = false;

    if (!accessToken && refreshToken) {
      try {
        refreshed = await refreshTokens(env, refreshToken);
        accessToken = refreshed.accessToken;
      } catch (error) {
        // invalid_grant·401이면 refresh token을 더는 쓸 수 없다. 429·네트워크 오류면 남겨 두고 다음에 다시 시도한다.
        refreshRejected =
          error instanceof OauthTokenError &&
          (error.code === 'invalid_grant' || error.status === 401);
      }
    }

    let response: NextResponse;

    if (isBackend) {
      const headers = new Headers(request.headers);
      headers.delete('cookie');
      headers.delete('authorization');

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }

      // next.config rewrite에 맡기지 않고 여기서 직접 rewrite한다. 외부 주소로 가는 next.config rewrite는
      // proxy가 붙인 Set-Cookie를 응답에서 버리므로, 갱신한 토큰 쿠키가 브라우저에 저장되지 않는다.
      const backendUrl = `${env.API_BASE_URL.replace(/\/+$/, '')}${pathname.slice('/backend'.length)}${search}`;
      response = NextResponse.rewrite(backendUrl, { request: { headers } });
    } else if (!accessToken) {
      const loginUrl = new URL(LOGIN_PATH, origin);
      loginUrl.searchParams.set('returnTo', `${pathname}${search}`);
      response = NextResponse.redirect(loginUrl);
    } else if (refreshed) {
      // 이번 요청을 렌더링하는 서버 컴포넌트도 cookies()로 새 토큰을 읽도록 요청 쿠키를 바꿔 넘긴다.
      request.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken);
      request.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken);
      response = NextResponse.next({ request: { headers: new Headers(request.headers) } });
    } else {
      response = NextResponse.next();
    }

    if (refreshed) {
      setTokenCookies(request, response, refreshed);
    } else if (refreshRejected) {
      clearTokenCookies(response);
    }

    return response;
  };

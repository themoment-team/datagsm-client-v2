import { type NextRequest, NextResponse } from 'next/server';

import type { AppEnv, OauthEnv } from '../config';
import { ACCESS_TOKEN_COOKIE, LOGIN_PATH, REFRESH_TOKEN_COOKIE } from './authCookies';
import { OauthTokenError, type OauthTokens } from './oauthClient';
import { refreshOnce } from './refreshSingleFlight';
import { clearTokenCookies, setTokenCookies } from './tokenCookies';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const BACKEND_PREFIX = '/backend/';

type AuthProxyEnv = OauthEnv & Pick<AppEnv, 'API_BASE_URL'>;

// next.config의 /backend rewrite와 같은 규칙으로 API 주소를 만든다.
const toBackendUrl = (env: AuthProxyEnv, request: NextRequest) =>
  `${env.API_BASE_URL.replace(/\/+$/, '')}${request.nextUrl.pathname.slice(BACKEND_PREFIX.length - 1)}${request.nextUrl.search}`;

type RefreshResult =
  | { kind: 'none' }
  | { kind: 'refreshed'; tokens: OauthTokens }
  // refresh token을 더는 쓸 수 없다(invalid_grant 등). 쿠키를 지우고 다시 로그인하게 한다.
  | { kind: 'rejected' }
  // 429·네트워크 오류처럼 잠시 뒤 다시 될 수 있는 실패다. refresh token은 지우지 않는다.
  | { kind: 'failed' };

// access token 쿠키가 없고 refresh token이 있으면 갱신한다. 쿠키는 실제 만료보다 먼저 사라지게 저장한다.
const refreshIfNeeded = async (env: OauthEnv, request: NextRequest): Promise<RefreshResult> => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (request.cookies.has(ACCESS_TOKEN_COOKIE) || !refreshToken) {
    return { kind: 'none' };
  }

  try {
    return { kind: 'refreshed', tokens: await refreshOnce(env, refreshToken) };
  } catch (error) {
    const rejected =
      error instanceof OauthTokenError && (error.isInvalidGrant || error.status === 401);

    return { kind: rejected ? 'rejected' : 'failed' };
  }
};

// 갱신 결과를 브라우저 쿠키에 반영한다.
const applyRefresh = (response: NextResponse, result: RefreshResult, secure: boolean) => {
  if (result.kind === 'refreshed') {
    setTokenCookies(response, result.tokens, secure);
  } else if (result.kind === 'rejected') {
    clearTokenCookies(response);
  }

  return response;
};

// 앱의 proxy.ts가 내보낸다. 어떤 페이지가 로그인을 요구하는지는 앱의 matcher가 정한다.
// - /backend/*: 쿠키의 access token을 Authorization 헤더로 바꿔 API 서버로 넘긴다.
// - 그 밖에 matcher에 걸린 페이지: 토큰이 없으면 로그인으로 보낸다.
// 두 경우 모두 access token이 없고 refresh token이 있으면 먼저 갱신한다.
export const createAuthProxy = (env: AuthProxyEnv) => async (request: NextRequest) => {
  const { pathname, search, origin, protocol } = request.nextUrl;
  const secure = protocol === 'https:';

  if (pathname.startsWith(BACKEND_PREFIX)) {
    // 쿠키는 브라우저가 자동으로 보내므로, 상태를 바꾸는 요청은 다른 사이트에서 온 것을 막는다(CSRF).
    const requestOrigin = request.headers.get('origin');

    if (!SAFE_METHODS.has(request.method) && requestOrigin !== null && requestOrigin !== origin) {
      return new NextResponse(null, { status: 403 });
    }

    const result = await refreshIfNeeded(env, request);
    const token =
      result.kind === 'refreshed'
        ? result.tokens.accessToken
        : request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('authorization');

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // next.config rewrite에 맡기지 않고 여기서 직접 rewrite한다. 외부 주소로 가는 next.config rewrite는
    // proxy가 붙인 Set-Cookie를 응답에서 버리므로, 갱신한 토큰 쿠키가 브라우저에 저장되지 않는다.
    return applyRefresh(
      NextResponse.rewrite(toBackendUrl(env, request), { request: { headers } }),
      result,
      secure,
    );
  }

  const result = await refreshIfNeeded(env, request);

  if (result.kind === 'refreshed') {
    // 이번 요청을 렌더링하는 서버 컴포넌트도 cookies()로 새 토큰을 읽도록 요청 쿠키를 바꿔 넘긴다.
    request.cookies.set(ACCESS_TOKEN_COOKIE, result.tokens.accessToken);
    request.cookies.set(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken);

    return applyRefresh(
      NextResponse.next({ request: { headers: new Headers(request.headers) } }),
      result,
      secure,
    );
  }

  if (!request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    const loginUrl = new URL(LOGIN_PATH, origin);
    loginUrl.searchParams.set('returnTo', `${pathname}${search}`);

    return applyRefresh(NextResponse.redirect(loginUrl), result, secure);
  }

  return NextResponse.next();
};

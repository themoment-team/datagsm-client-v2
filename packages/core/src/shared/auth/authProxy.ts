import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, LOGIN_PATH } from './authCookies';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const BACKEND_PREFIX = '/backend/';

// 앱의 proxy.ts가 그대로 내보낸다. 어떤 페이지가 로그인을 요구하는지는 앱의 matcher가 정한다.
// - /backend/*: 쿠키의 access token을 Authorization 헤더로 바꿔 API 서버로 넘긴다(next.config rewrite).
// - 그 밖에 matcher에 걸린 페이지: 토큰이 없으면 로그인으로 보낸다.
export const authProxy = (request: NextRequest) => {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { pathname, search, origin } = request.nextUrl;

  if (pathname.startsWith(BACKEND_PREFIX)) {
    // 쿠키는 브라우저가 자동으로 보내므로, 상태를 바꾸는 요청은 다른 사이트에서 온 것을 막는다(CSRF).
    const requestOrigin = request.headers.get('origin');

    if (!SAFE_METHODS.has(request.method) && requestOrigin !== null && requestOrigin !== origin) {
      return new NextResponse(null, { status: 403 });
    }

    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('authorization');

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return NextResponse.next({ request: { headers } });
  }

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, origin);
    loginUrl.searchParams.set('returnTo', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

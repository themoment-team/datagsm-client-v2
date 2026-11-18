import { type NextRequest, NextResponse } from 'next/server';

import type { OauthEnv } from '../config';
import {
  CALLBACK_PATH,
  clearTokenCookies,
  cookieOptions,
  LOGIN_FLOW_COOKIE,
  setTokenCookies,
} from './cookies';
import {
  buildAuthorizeUrl,
  createCodeChallenge,
  createRandomToken,
  exchangeCodeForTokens,
} from './oauth';

interface LoginFlow {
  state: string;
  codeVerifier: string;
  returnTo: string;
}

// 로그인 뒤 돌아갈 경로는 같은 앱 안의 경로만 허용한다. 외부 주소로 보내는 open redirect를 막는다.
export const toSafeReturnTo = (value: unknown) =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.startsWith('/\\')
    ? value
    : '/';

const readLoginFlow = (request: NextRequest): LoginFlow | null => {
  try {
    const flow = JSON.parse(request.cookies.get(LOGIN_FLOW_COOKIE)?.value ?? '');

    if (typeof flow.state !== 'string' || typeof flow.codeVerifier !== 'string') {
      return null;
    }

    return {
      state: flow.state,
      codeVerifier: flow.codeVerifier,
      returnTo: toSafeReturnTo(flow.returnTo),
    };
  } catch {
    return null;
  }
};

// 콜백 주소는 요청이 들어온 앱 주소로 만든다. 인가 서버의 client에 앱마다 이 주소를 등록해 둔다.
const callbackUrl = (request: NextRequest) =>
  new URL(CALLBACK_PATH, request.nextUrl.origin).toString();

// 콜백의 응답이다. 임시 쿠키는 일회성이라 성공·실패와 상관없이 지운다.
const callbackResponse = (response: NextResponse) => {
  response.cookies.delete({ name: LOGIN_FLOW_COOKIE, path: CALLBACK_PATH });

  return response;
};

const callbackFailure = (message: string, status: number) =>
  callbackResponse(new NextResponse(message, { status }));

// client·admin이 같은 동작을 쓰므로 core가 Route Handler를 만들고, 앱은 검증한 env만 넘긴다.
export const createAuthRoutes = (env: OauthEnv) => {
  // GET /api/login?returnTo=/path → 인가 서버로 보낸다. 로그인 화면은 oauth 앱이 띄운다.
  const login = async (request: NextRequest) => {
    const state = createRandomToken();
    const codeVerifier = createRandomToken();
    const returnTo = toSafeReturnTo(request.nextUrl.searchParams.get('returnTo'));
    const authorizeUrl = buildAuthorizeUrl(env, {
      redirectUri: callbackUrl(request),
      state,
      codeChallenge: await createCodeChallenge(codeVerifier),
    });

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(
      LOGIN_FLOW_COOKIE,
      JSON.stringify({ state, codeVerifier, returnTo }),
      cookieOptions(request, 600, CALLBACK_PATH),
    );

    return response;
  };

  // GET /api/callback?code&state → 서버에서 code를 토큰으로 바꾸고 httpOnly 쿠키에 담는다.
  // 인가 서버는 동의 거부 등 실패도 이 주소로 돌려보낸다(?error=access_denied&state=...).
  const callback = async (request: NextRequest) => {
    const flow = readLoginFlow(request);
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // state를 먼저 확인한다. 다른 사이트가 만든 콜백(오류 콜백 포함)은 여기서 걸러진다.
    if (!flow || searchParams.get('state') !== flow.state) {
      return callbackFailure(
        '로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.',
        400,
      );
    }

    if (error === 'access_denied') {
      return callbackFailure('권한에 동의해야 로그인할 수 있습니다. 다시 시도해 주세요.', 403);
    }

    if (error || !code) {
      return callbackFailure('로그인에 실패했습니다. 다시 시도해 주세요.', 400);
    }

    try {
      const tokens = await exchangeCodeForTokens(env, {
        code,
        codeVerifier: flow.codeVerifier,
        redirectUri: callbackUrl(request),
      });
      const response = callbackResponse(
        NextResponse.redirect(new URL(flow.returnTo, request.nextUrl.origin)),
      );
      setTokenCookies(request, response, tokens);

      return response;
    } catch {
      return callbackFailure('로그인을 완료하지 못했습니다. 잠시 뒤 다시 시도해 주세요.', 502);
    }
  };

  // POST /api/logout → 이 앱의 토큰 쿠키(access, refresh)를 지운다.
  // 인가 서버(IdP) 세션은 브라우저가 이 요청 전에 직접 끝낸다(features/logout의 LogoutButton).
  const logout = (request: NextRequest) => {
    if (request.headers.get('origin') !== request.nextUrl.origin) {
      return new NextResponse(null, { status: 403 });
    }

    const response = NextResponse.redirect(new URL('/', request.nextUrl.origin), 303);
    clearTokenCookies(response);

    return response;
  };

  return { login, callback, logout };
};

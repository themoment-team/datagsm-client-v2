import { type NextRequest, NextResponse } from 'next/server';

import type { OauthEnv } from '../config';
import {
  ACCESS_TOKEN_COOKIE,
  CALLBACK_PATH,
  LOGIN_FLOW_COOKIE,
  LOGIN_FLOW_MAX_AGE_SECONDS,
} from './authCookies';
import { buildAuthorizeUrl, exchangeCodeForTokens } from './oauthClient';
import { createCodeChallenge, createRandomToken } from './pkce';
import { toSafeReturnTo } from './returnTo';

interface LoginFlow {
  state: string;
  codeVerifier: string;
  returnTo: string;
}

const isHttps = (request: NextRequest) => request.nextUrl.protocol === 'https:';

const readLoginFlow = (request: NextRequest): LoginFlow | null => {
  const raw = request.cookies.get(LOGIN_FLOW_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const flow = JSON.parse(raw) as Partial<LoginFlow>;

    return typeof flow.state === 'string' && typeof flow.codeVerifier === 'string'
      ? {
          state: flow.state,
          codeVerifier: flow.codeVerifier,
          returnTo: toSafeReturnTo(flow.returnTo),
        }
      : null;
  } catch {
    return null;
  }
};

// 콜백 주소는 요청이 들어온 앱 주소로 만든다. 인가 서버의 client에 앱마다 이 주소를 등록해 둔다.
const callbackUrl = (request: NextRequest) =>
  new URL(CALLBACK_PATH, request.nextUrl.origin).toString();

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
    response.cookies.set(LOGIN_FLOW_COOKIE, JSON.stringify({ state, codeVerifier, returnTo }), {
      httpOnly: true,
      secure: isHttps(request),
      sameSite: 'lax',
      path: CALLBACK_PATH,
      maxAge: LOGIN_FLOW_MAX_AGE_SECONDS,
    });

    return response;
  };

  // GET /api/callback?code&state → 서버에서 code를 토큰으로 바꾸고 httpOnly 쿠키에 담는다.
  // 인가 서버는 동의 거부 등 실패도 이 주소로 돌려보낸다(?error=access_denied&state=...).
  const callback = async (request: NextRequest) => {
    const flow = readLoginFlow(request);
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // 임시 쿠키는 일회성이다. 결과와 상관없이 응답마다 지운다.
    const finish = (response: NextResponse) => {
      response.cookies.delete({ name: LOGIN_FLOW_COOKIE, path: CALLBACK_PATH });

      return response;
    };
    const fail = (message: string, status: number) => finish(new NextResponse(message, { status }));

    // state를 먼저 확인한다. 다른 사이트가 만든 콜백(오류 콜백 포함)은 여기서 걸러진다.
    if (!flow || !state || state !== flow.state) {
      return fail('로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.', 400);
    }

    if (error === 'access_denied') {
      return fail('권한에 동의해야 로그인할 수 있습니다. 다시 시도해 주세요.', 403);
    }

    if (error || !code) {
      return fail('로그인에 실패했습니다. 다시 시도해 주세요.', 400);
    }

    let tokens;

    try {
      tokens = await exchangeCodeForTokens(env, {
        code,
        codeVerifier: flow.codeVerifier,
        redirectUri: callbackUrl(request),
      });
    } catch {
      return fail('로그인을 완료하지 못했습니다. 잠시 뒤 다시 시도해 주세요.', 502);
    }

    const response = finish(NextResponse.redirect(new URL(flow.returnTo, request.nextUrl.origin)));
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: isHttps(request),
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expiresIn,
    });

    return response;
  };

  // POST /api/logout → 이 앱의 토큰 쿠키만 지운다. 인가 서버(IdP) 세션 종료는 아직 하지 않는다.
  const logout = (request: NextRequest) => {
    if (request.headers.get('origin') !== request.nextUrl.origin) {
      return new NextResponse(null, { status: 403 });
    }

    const response = NextResponse.redirect(new URL('/', request.nextUrl.origin), 303);
    response.cookies.delete(ACCESS_TOKEN_COOKIE);

    return response;
  };

  return { login, callback, logout };
};

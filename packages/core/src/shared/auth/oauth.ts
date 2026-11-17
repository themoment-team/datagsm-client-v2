import type { OauthEnv } from '../config';

// 인가 서버(https://docs.datagsm.kr/oauth)와 주고받는 요청을 모아 둔다.

export interface OauthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 토큰 요청 실패다. code는 OAuth 오류 이름(invalid_grant 등)이고, 없으면 null이다.
export class OauthTokenError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(`토큰 요청에 실패했습니다(${status}${code ? `, ${code}` : ''}).`);
    this.name = 'OauthTokenError';
  }
}

// PKCE(RFC 7636) S256. Web Crypto만 써서 Node 런타임과 Proxy 어디서나 동작한다.
const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const createRandomToken = () => toBase64Url(crypto.getRandomValues(new Uint8Array(32)));

export const createCodeChallenge = async (verifier: string) =>
  toBase64Url(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))),
  );

export const buildAuthorizeUrl = (
  env: OauthEnv,
  params: { redirectUri: string; state: string; codeChallenge: string },
) => {
  const url = new URL('/v1/oauth/authorize', env.OAUTH_AUTHORIZATION_BASE_URL);

  // scope는 일부러 보내지 않는다. 생략하면 인가 서버가 client에 등록된 범위(opt-in 범위 제외)를 준다.
  // 등록되지 않은 값을 보내면 invalid_scope로 로그인이 막힌다. 웹 서버는 토큰에 scopes 클레임이
  // 있는지만 보므로, client에 등록된 범위를 확인한 뒤에 명시한다(v1도 생략했다).
  url.search = new URLSearchParams({
    client_id: env.OAUTH_CLIENT_ID,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  return url;
};

// token 응답은 공통 응답 형식(CommonApiResponse)으로 감싸지 않은 OAuth 표준 JSON이다.
const requestTokens = async (env: OauthEnv, body: Record<string, string>): Promise<OauthTokens> => {
  const response = await fetch(new URL('/v1/oauth/token', env.OAUTH_AUTHORIZATION_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new OauthTokenError(response.status, typeof json.error === 'string' ? json.error : null);
  }

  if (
    typeof json.access_token !== 'string' ||
    typeof json.refresh_token !== 'string' ||
    typeof json.expires_in !== 'number'
  ) {
    throw new Error('토큰 응답 형식이 올바르지 않습니다.');
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
};

export const exchangeCodeForTokens = (
  env: OauthEnv,
  params: { code: string; codeVerifier: string; redirectUri: string },
) =>
  requestTokens(env, {
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

// 갱신할 때마다 새 refresh token이 온다(회전). 같은 refresh token으로 동시에 갱신하면 인가 서버가
// 재사용으로 보고 저장된 토큰까지 지운다. 만료 직후 요청이 몰리면 proxy가 동시에 실행되므로,
// 같은 토큰의 갱신은 한 번만 보내고 성공한 결과는 30초 동안 함께 쓴다.
// - 이 서버 인스턴스 안에서만 합쳐진다. 다른 인스턴스와 겹치면 거부되고 다시 로그인하게 된다.
// - 키가 refresh token 자체라서 다른 사용자의 결과를 받을 수 없다.
const refreshing = new Map<string, Promise<OauthTokens>>();

export const refreshTokens = (env: OauthEnv, refreshToken: string) => {
  const pending = refreshing.get(refreshToken);

  if (pending) {
    return pending;
  }

  const promise = requestTokens(env, { grant_type: 'refresh_token', refresh_token: refreshToken });
  refreshing.set(refreshToken, promise);
  promise.then(
    () => setTimeout(() => refreshing.delete(refreshToken), 30_000).unref?.(),
    () => refreshing.delete(refreshToken),
  );

  return promise;
};

// 테스트에서 갱신 결과 공유를 비운다.
export const clearRefreshingForTest = () => {
  refreshing.clear();
};

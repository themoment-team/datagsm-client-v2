import type { OauthEnv } from '../config';

export interface OauthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  error?: unknown;
}

// 토큰 요청이 실패한 이유다. invalid_grant면 refresh token이 더는 쓸 수 없다는 뜻이다.
export class OauthTokenError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(`토큰 요청에 실패했습니다(${status}${code ? `, ${code}` : ''}).`);
    this.name = 'OauthTokenError';
  }

  get isInvalidGrant() {
    return this.code === 'invalid_grant';
  }
}

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

// 인가 서버의 token 응답은 공통 응답 형식(CommonApiResponse)으로 감싸지 않은 OAuth 표준 JSON이다.
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

  const json = (await response.json().catch(() => ({}))) as TokenResponse;

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

// 갱신할 때마다 새 refresh token이 온다(회전). 응답의 새 값으로 바꿔 저장해야 한다.
export const refreshTokens = (env: OauthEnv, refreshToken: string) =>
  requestTokens(env, { grant_type: 'refresh_token', refresh_token: refreshToken });

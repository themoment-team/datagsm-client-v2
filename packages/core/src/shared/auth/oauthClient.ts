import type { OauthEnv } from '../config';

export interface OauthTokens {
  accessToken: string;
  expiresIn: number;
}

interface TokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
}

export const buildAuthorizeUrl = (
  env: OauthEnv,
  params: { redirectUri: string; state: string; codeChallenge: string },
) => {
  const url = new URL('/v1/oauth/authorize', env.OAUTH_AUTHORIZATION_BASE_URL);

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
export const exchangeCodeForTokens = async (
  env: OauthEnv,
  params: { code: string; codeVerifier: string; redirectUri: string },
): Promise<OauthTokens> => {
  const response = await fetch(new URL('/v1/oauth/token', env.OAUTH_AUTHORIZATION_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      code_verifier: params.codeVerifier,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`토큰 발급에 실패했습니다(${response.status}).`);
  }

  const body = (await response.json()) as TokenResponse;

  if (typeof body.access_token !== 'string' || typeof body.expires_in !== 'number') {
    throw new Error('토큰 응답 형식이 올바르지 않습니다.');
  }

  return { accessToken: body.access_token, expiresIn: body.expires_in };
};

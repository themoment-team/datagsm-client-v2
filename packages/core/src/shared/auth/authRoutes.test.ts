import { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAuthRoutes, toSafeReturnTo } from './authRoutes';

const env = {
  OAUTH_AUTHORIZATION_BASE_URL: 'https://oauth.example',
  OAUTH_CLIENT_ID: 'client-id',
  OAUTH_CLIENT_SECRET: 'client-secret',
};

const { login, callback, logout } = createAuthRoutes(env);

const request = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(new URL(path, 'https://datagsm.kr'), init);

const loginFlowCookie = (flow: object) =>
  `datagsm_login=${encodeURIComponent(JSON.stringify(flow))}`;

describe('login', () => {
  it('PKCE와 state를 담아 인가 서버로 보내고 임시 쿠키를 남긴다', async () => {
    const response = await login(request('/api/login?returnTo=%2Fapi-keys'));
    const location = new URL(response.headers.get('location') ?? '');
    const flow = JSON.parse(response.cookies.get('datagsm_login')?.value ?? '{}');

    expect(location.origin + location.pathname).toBe('https://oauth.example/v1/oauth/authorize');
    expect(Object.fromEntries(location.searchParams)).toMatchObject({
      client_id: 'client-id',
      redirect_uri: 'https://datagsm.kr/api/callback',
      response_type: 'code',
      code_challenge_method: 'S256',
      state: flow.state,
    });
    expect(location.searchParams.get('code_challenge')).not.toBe(flow.codeVerifier);
    expect(location.searchParams.has('scope')).toBe(false);
    expect(flow.returnTo).toBe('/api-keys');
    expect(response.cookies.get('datagsm_login')).toMatchObject({
      httpOnly: true,
      secure: true,
      path: '/api/callback',
    });
  });

  it('외부 주소로 돌아가려는 요청은 홈으로 바꾼다', async () => {
    const response = await login(request('/api/login?returnTo=https%3A%2F%2Fevil.example'));

    expect(JSON.parse(response.cookies.get('datagsm_login')?.value ?? '{}').returnTo).toBe('/');
  });
});

describe('callback', () => {
  const flow = { state: 'state-1', codeVerifier: 'verifier-1', returnTo: '/api-keys' };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ access_token: 'access-1', refresh_token: 'refresh-1', expires_in: 3600 }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('code를 토큰으로 바꿔 httpOnly 쿠키에 담고 원래 경로로 보낸다', async () => {
    const response = await callback(
      request('/api/callback?code=code-1&state=state-1', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      new URL('https://oauth.example/v1/oauth/token'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toEqual({
      grant_type: 'authorization_code',
      code: 'code-1',
      redirect_uri: 'https://datagsm.kr/api/callback',
      client_id: 'client-id',
      client_secret: 'client-secret',
      code_verifier: 'verifier-1',
    });
    expect(response.headers.get('location')).toBe('https://datagsm.kr/api-keys');
    expect(response.cookies.get('datagsm_at')).toMatchObject({
      value: 'access-1',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      // 실제 만료보다 60초 먼저 사라지게 해서 proxy가 미리 갱신하게 한다.
      maxAge: 3540,
    });
    expect(response.cookies.get('datagsm_rt')).toMatchObject({
      value: 'refresh-1',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
  });

  it('state가 다르면 토큰을 요청하지 않고 400으로 답하며 임시 쿠키를 지운다', async () => {
    const response = await callback(
      request('/api/callback?code=code-1&state=other', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(response.cookies.get('datagsm_login')).toMatchObject({
      value: '',
      path: '/api/callback',
    });
  });

  it('사용자가 동의를 거부하면 403으로 답하고 임시 쿠키를 지운다', async () => {
    const response = await callback(
      request('/api/callback?error=access_denied&error_description=denied&state=state-1', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toContain('권한에 동의해야');
    expect(fetch).not.toHaveBeenCalled();
    expect(response.cookies.get('datagsm_login')?.value).toBe('');
  });

  it('state가 맞지 않는 오류 콜백은 오류 내용보다 state 검증을 먼저 한다', async () => {
    const response = await callback(
      request('/api/callback?error=access_denied&state=other', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('그 밖의 오류나 code가 없는 콜백은 400으로 답한다', async () => {
    const response = await callback(
      request('/api/callback?error=server_error&state=state-1', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('임시 쿠키가 없으면 400으로 답한다', async () => {
    const response = await callback(request('/api/callback?code=code-1&state=state-1'));

    expect(response.status).toBe(400);
  });

  it('토큰 발급이 실패하면 쿠키를 만들지 않고 502로 답하며 임시 쿠키를 지운다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 400 }));

    const response = await callback(
      request('/api/callback?code=code-1&state=state-1', {
        headers: { cookie: loginFlowCookie(flow) },
      }),
    );

    expect(response.status).toBe(502);
    expect(response.cookies.get('datagsm_at')).toBeUndefined();
    expect(response.cookies.get('datagsm_login')?.value).toBe('');
  });
});

describe('logout', () => {
  it('같은 사이트의 요청이면 토큰 쿠키를 지우고 홈으로 보낸다', () => {
    const response = logout(
      request('/api/logout', { method: 'POST', headers: { origin: 'https://datagsm.kr' } }),
    );

    expect(response.status).toBe(303);
    expect(response.cookies.get('datagsm_at')?.value).toBe('');
    expect(response.cookies.get('datagsm_rt')?.value).toBe('');
  });

  it('다른 사이트에서 온 요청은 403으로 막는다', () => {
    const response = logout(
      request('/api/logout', { method: 'POST', headers: { origin: 'https://evil.example' } }),
    );

    expect(response.status).toBe(403);
  });
});

it.each([
  ['/api-keys?page=2', '/api-keys?page=2'],
  ['/', '/'],
  [null, '/'],
  ['', '/'],
  ['https://evil.example', '/'],
  ['//evil.example', '/'],
  ['/\\evil.example', '/'],
])('돌아갈 경로 %s는 %s로 바꾼다', (input, expected) => {
  expect(toSafeReturnTo(input)).toBe(expected);
});

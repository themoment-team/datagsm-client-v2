import { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAuthProxy } from './authProxy';
import { resetRefreshSingleFlight } from './refreshSingleFlight';

const env = {
  API_BASE_URL: 'https://api.example/base',
  OAUTH_AUTHORIZATION_BASE_URL: 'https://oauth.example',
  OAUTH_CLIENT_ID: 'client-id',
  OAUTH_CLIENT_SECRET: 'client-secret',
};

const authProxy = createAuthProxy(env);

const request = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(new URL(path, 'https://datagsm.kr'), init);

const refreshed = () =>
  Response.json({ access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 3600 });

beforeEach(() => {
  resetRefreshSingleFlight();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => refreshed()),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('페이지', () => {
  it('토큰이 없으면 돌아올 경로를 담아 로그인으로 보낸다', async () => {
    const response = await authProxy(request('/api-keys?page=2'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://datagsm.kr/api/login?returnTo=%2Fapi-keys%3Fpage%3D2',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('access token이 있으면 갱신하지 않고 그대로 통과시킨다', async () => {
    const response = await authProxy(
      request('/api-keys', { headers: { cookie: 'datagsm_at=token; datagsm_rt=refresh-1' } }),
    );

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('access token이 만료됐으면 갱신해 쿠키를 바꾸고, 서버 컴포넌트에도 새 토큰을 넘긴다', async () => {
    const response = await authProxy(
      request('/api-keys', { headers: { cookie: 'datagsm_rt=refresh-1' } }),
    );

    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toEqual({
      grant_type: 'refresh_token',
      refresh_token: 'refresh-1',
      client_id: 'client-id',
      client_secret: 'client-secret',
    });
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('datagsm_at=access-2');
    expect(response.cookies.get('datagsm_at')).toMatchObject({ value: 'access-2', maxAge: 3540 });
    expect(response.cookies.get('datagsm_rt')?.value).toBe('refresh-2');
  });

  it('refresh token이 거부되면 쿠키를 지우고 로그인으로 보낸다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: 'invalid_grant' }, { status: 400 }),
    );

    const response = await authProxy(
      request('/api-keys', { headers: { cookie: 'datagsm_rt=refresh-1' } }),
    );

    expect(response.status).toBe(307);
    expect(response.cookies.get('datagsm_rt')?.value).toBe('');
  });

  it('요청 한도 초과(429)면 refresh token을 지우지 않고 로그인으로 보낸다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 429 }));

    const response = await authProxy(
      request('/api-keys', { headers: { cookie: 'datagsm_rt=refresh-1' } }),
    );

    expect(response.status).toBe(307);
    expect(response.cookies.get('datagsm_rt')).toBeUndefined();
  });
});

describe('/backend', () => {
  it('API 서버 주소로 rewrite하고 경로와 쿼리를 그대로 넘긴다', async () => {
    const response = await authProxy(request('/backend/v1/clients?page=2'));

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://api.example/base/v1/clients?page=2',
    );
  });

  it('쿠키의 토큰을 Authorization 헤더로 바꾸고 쿠키는 넘기지 않는다', async () => {
    const response = await authProxy(
      request('/backend/v1/clients', { headers: { cookie: 'datagsm_at=token; other=1' } }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer token');
    expect(response.headers.get('x-middleware-override-headers')).not.toContain('cookie');
  });

  it('토큰이 없어도 막지 않고 넘긴다(서버가 401로 답한다)', async () => {
    const response = await authProxy(request('/backend/v1/clients'));

    expect(response.headers.get('x-middleware-rewrite')).not.toBeNull();
    expect(response.headers.get('x-middleware-request-authorization')).toBeNull();
  });

  it('access token이 만료됐으면 갱신한 토큰으로 넘기고 쿠키를 바꾼다', async () => {
    const response = await authProxy(
      request('/backend/v1/clients', { headers: { cookie: 'datagsm_rt=refresh-1' } }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer access-2');
    expect(response.cookies.get('datagsm_at')?.value).toBe('access-2');
    expect(response.cookies.get('datagsm_rt')?.value).toBe('refresh-2');
  });

  it('동시에 들어온 요청은 같은 refresh token으로 한 번만 갱신한다', async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        authProxy(request('/backend/v1/clients', { headers: { cookie: 'datagsm_rt=refresh-1' } })),
      ),
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    for (const response of responses) {
      expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer access-2');
    }
  });

  it('갱신이 거부되면 헤더 없이 넘기고 쿠키를 지운다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: 'invalid_grant' }, { status: 400 }),
    );

    const response = await authProxy(
      request('/backend/v1/clients', { headers: { cookie: 'datagsm_rt=refresh-1' } }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBeNull();
    expect(response.cookies.get('datagsm_rt')?.value).toBe('');
  });

  it('다른 사이트에서 온 변경 요청은 갱신하지 않고 403으로 막는다', async () => {
    const response = await authProxy(
      request('/backend/v1/clients', {
        method: 'POST',
        headers: { cookie: 'datagsm_rt=refresh-1', origin: 'https://evil.example' },
      }),
    );

    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('같은 사이트의 변경 요청은 통과시킨다', async () => {
    const response = await authProxy(
      request('/backend/v1/clients', {
        method: 'POST',
        headers: { cookie: 'datagsm_at=token', origin: 'https://datagsm.kr' },
      }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer token');
  });
});

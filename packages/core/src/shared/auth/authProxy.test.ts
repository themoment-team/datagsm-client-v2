import { NextRequest } from 'next/server';

import { describe, expect, it } from 'vitest';

import { authProxy } from './authProxy';

const request = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(new URL(path, 'https://datagsm.kr'), init);

describe('페이지', () => {
  it('토큰이 없으면 돌아올 경로를 담아 로그인으로 보낸다', () => {
    const response = authProxy(request('/api-keys?page=2'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://datagsm.kr/api/login?returnTo=%2Fapi-keys%3Fpage%3D2',
    );
  });

  it('토큰이 있으면 그대로 통과시킨다', () => {
    const response = authProxy(request('/api-keys', { headers: { cookie: 'datagsm_at=token' } }));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});

describe('/backend', () => {
  it('쿠키의 토큰을 Authorization 헤더로 바꾸고 쿠키는 넘기지 않는다', () => {
    const response = authProxy(
      request('/backend/v1/clients', { headers: { cookie: 'datagsm_at=token; other=1' } }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer token');
    expect(response.headers.get('x-middleware-override-headers')).not.toContain('cookie');
  });

  it('토큰이 없어도 막지 않고 넘긴다(서버가 401로 답한다)', () => {
    const response = authProxy(request('/backend/v1/clients'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-request-authorization')).toBeNull();
  });

  it('다른 사이트에서 온 변경 요청은 403으로 막는다', () => {
    const response = authProxy(
      request('/backend/v1/clients', {
        method: 'POST',
        headers: { cookie: 'datagsm_at=token', origin: 'https://evil.example' },
      }),
    );

    expect(response.status).toBe(403);
  });

  it('같은 사이트의 변경 요청은 통과시킨다', () => {
    const response = authProxy(
      request('/backend/v1/clients', {
        method: 'POST',
        headers: { cookie: 'datagsm_at=token', origin: 'https://datagsm.kr' },
      }),
    );

    expect(response.headers.get('x-middleware-request-authorization')).toBe('Bearer token');
  });
});

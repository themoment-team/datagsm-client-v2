import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearRefreshingForTest,
  createCodeChallenge,
  createRandomToken,
  refreshTokens,
} from './oauth';

const env = {
  OAUTH_AUTHORIZATION_BASE_URL: 'https://oauth.example',
  OAUTH_CLIENT_ID: 'client-id',
  OAUTH_CLIENT_SECRET: 'client-secret',
};

describe('PKCE', () => {
  it('RFC 7636 부록 B의 예시와 같은 code challenge를 만든다', async () => {
    await expect(createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).resolves.toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('무작위 토큰은 URL에 그대로 쓸 수 있는 43자 문자열이다', () => {
    const token = createRandomToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(createRandomToken()).not.toBe(token);
  });
});

describe('refreshTokens', () => {
  let issued = 0;

  beforeEach(() => {
    issued = 0;
    clearRefreshingForTest();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        issued += 1;

        return Response.json({
          access_token: `access-${issued}`,
          refresh_token: `refresh-${issued + 1}`,
          expires_in: 3600,
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('같은 refresh token의 갱신은 끝난 뒤에도 잠시 같은 결과를 돌려준다', async () => {
    const first = await refreshTokens(env, 'refresh-1');
    const second = await refreshTokens(env, 'refresh-1');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('다른 refresh token은 따로 갱신한다', async () => {
    await Promise.all([refreshTokens(env, 'refresh-a'), refreshTokens(env, 'refresh-b')]);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('실패한 갱신은 기억하지 않아 다음 요청에서 다시 시도한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 429 }));

    await expect(refreshTokens(env, 'refresh-1')).rejects.toMatchObject({ status: 429 });
    await expect(refreshTokens(env, 'refresh-1')).resolves.toMatchObject({
      accessToken: 'access-1',
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { refreshOnce, resetRefreshSingleFlight } from './refreshSingleFlight';

const env = {
  OAUTH_AUTHORIZATION_BASE_URL: 'https://oauth.example',
  OAUTH_CLIENT_ID: 'client-id',
  OAUTH_CLIENT_SECRET: 'client-secret',
};

let issued = 0;

beforeEach(() => {
  issued = 0;
  resetRefreshSingleFlight();
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
  const first = await refreshOnce(env, 'refresh-1');
  const second = await refreshOnce(env, 'refresh-1');

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(second).toEqual(first);
});

it('다른 refresh token은 따로 갱신한다', async () => {
  await Promise.all([refreshOnce(env, 'refresh-a'), refreshOnce(env, 'refresh-b')]);

  expect(fetch).toHaveBeenCalledTimes(2);
});

it('실패한 갱신은 기억하지 않아 다음 요청에서 다시 시도한다', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 429 }));

  await expect(refreshOnce(env, 'refresh-1')).rejects.toMatchObject({ status: 429 });
  await expect(refreshOnce(env, 'refresh-1')).resolves.toMatchObject({ accessToken: 'access-1' });
  expect(fetch).toHaveBeenCalledTimes(2);
});

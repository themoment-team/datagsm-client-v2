import { beforeEach, expect, it, vi } from 'vitest';

const STATUS_BASE_URLS = {
  STATUS_WEB_BASE_URL: 'http://localhost:8081',
  STATUS_OPENAPI_BASE_URL: 'http://localhost:8082',
  STATUS_OAUTH_AUTHORIZATION_BASE_URL: 'http://localhost:8083',
  STATUS_OAUTH_RESOURCE_BASE_URL: 'http://localhost:8084',
};

// env.ts는 불러오는 시점에 검증하므로, 케이스마다 모듈을 새로 불러온다.
// 케이스마다 올바른 값을 먼저 넣어 두고, 확인할 변수 하나만 바꾼다.
beforeEach(() => {
  vi.resetModules();

  for (const [key, value] of Object.entries(STATUS_BASE_URLS)) {
    vi.stubEnv(key, value);
  }
});

it('상태 서버 base URL이 모두 올바르면 값을 그대로 준다', async () => {
  const { env } = await import('./env');

  expect(env).toEqual(STATUS_BASE_URLS);
});

it.each(Object.keys(STATUS_BASE_URLS))('%s가 없으면 throw한다', async (key) => {
  vi.stubEnv(key, undefined);

  await expect(import('./env')).rejects.toThrow(`${key}: 값이 없습니다`);
});

it('상태 서버 base URL이 http(s) URL이 아니면 throw한다', async () => {
  vi.stubEnv('STATUS_OPENAPI_BASE_URL', 'openapi.internal');

  await expect(import('./env')).rejects.toThrow(
    'STATUS_OPENAPI_BASE_URL: http 또는 https URL이어야 합니다',
  );
});

it('API_BASE_URL은 받지 않는다', async () => {
  vi.stubEnv('API_BASE_URL', undefined);

  const { env } = await import('./env');

  expect(env).not.toHaveProperty('API_BASE_URL');
});

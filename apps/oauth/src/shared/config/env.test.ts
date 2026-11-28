import { beforeEach, expect, it, vi } from 'vitest';

// env.ts는 불러오는 시점에 검증하므로, 케이스마다 모듈을 새로 불러온다.
// 케이스마다 하나만 바꾸도록 나머지 필수 변수는 올바른 값으로 채워 둔다.
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('API_BASE_URL', 'http://localhost:8080');
  vi.stubEnv('APP_CLIENT_URL', 'http://localhost:3000');
});

it('API_BASE_URL이 없으면 throw한다', async () => {
  vi.stubEnv('API_BASE_URL', undefined);

  await expect(import('./env')).rejects.toThrow('API_BASE_URL: 값이 없습니다');
});

it('API_BASE_URL이 http(s) URL이 아니면 throw한다', async () => {
  vi.stubEnv('API_BASE_URL', 'localhost:8080');

  await expect(import('./env')).rejects.toThrow('API_BASE_URL: http 또는 https URL이어야 합니다');
});

it('APP_CLIENT_URL이 없으면 throw한다', async () => {
  vi.stubEnv('APP_CLIENT_URL', undefined);

  await expect(import('./env')).rejects.toThrow('APP_CLIENT_URL: 값이 없습니다');
});

it('값이 올바르면 그대로 준다', async () => {
  const { env } = await import('./env');

  expect(env).toEqual({
    API_BASE_URL: 'http://localhost:8080',
    APP_CLIENT_URL: 'http://localhost:3000',
  });
});

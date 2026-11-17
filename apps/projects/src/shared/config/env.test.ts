import { beforeEach, expect, it, vi } from 'vitest';

const APP_URLS = {
  APP_CLIENT_URL: 'http://localhost:3000',
  APP_DOCS_URL: 'http://localhost:3002',
  APP_STATUS_URL: 'http://localhost:3003',
  APP_PROJECTS_URL: 'http://localhost:3005',
};

// env.ts는 불러오는 시점에 검증하므로, 케이스마다 모듈을 새로 불러온다.
// 사이드바 앱 주소는 올바른 값을 먼저 넣어 두고, 확인할 변수만 바꾼다.
beforeEach(() => {
  vi.resetModules();

  for (const [key, value] of Object.entries(APP_URLS)) {
    vi.stubEnv(key, value);
  }
});

it('API_BASE_URL이 없으면 throw한다', async () => {
  vi.stubEnv('API_BASE_URL', undefined);

  await expect(import('./env')).rejects.toThrow('API_BASE_URL: 값이 없습니다');
});

it('API_BASE_URL이 http(s) URL이 아니면 throw한다', async () => {
  vi.stubEnv('API_BASE_URL', 'localhost:8080');

  await expect(import('./env')).rejects.toThrow('API_BASE_URL: http 또는 https URL이어야 합니다');
});

it('API_BASE_URL이 올바르면 값을 그대로 준다', async () => {
  vi.stubEnv('API_BASE_URL', 'http://localhost:8080');

  const { env } = await import('./env');

  expect(env.API_BASE_URL).toBe('http://localhost:8080');
});

it('사이드바 앱 주소가 없으면 throw한다', async () => {
  vi.stubEnv('API_BASE_URL', 'http://localhost:8080');
  vi.stubEnv('APP_DOCS_URL', undefined);

  await expect(import('./env')).rejects.toThrow('APP_DOCS_URL: 값이 없습니다');
});

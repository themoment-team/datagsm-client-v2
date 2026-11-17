import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { checkServerStatus, HEALTH_CHECK_TIMEOUT_MS } from './checkServerStatus';

const server = { id: 'web', label: 'Web', baseUrl: 'https://web.example.com/' } as const;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-17T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('base URL 끝의 /를 정리하고 /v1/health를 캐시 없이 요청한다', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  await checkServerStatus(server);

  expect(fetchMock).toHaveBeenCalledWith(
    'https://web.example.com/v1/health',
    expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }),
  );
});

it('2xx 응답이면 up과 응답 시간을 준다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok', { status: 200 })));

  const status = await checkServerStatus(server);

  expect(status).toEqual({
    id: 'web',
    label: 'Web',
    state: 'up',
    latencyMs: expect.any(Number),
    checkedAt: '2026-11-17T00:00:00.000Z',
  });
  expect(status.latencyMs).toBeGreaterThanOrEqual(0);
});

it('2xx가 아닌 응답이면 down이지만 응답 시간은 준다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 503 })));

  const status = await checkServerStatus(server);

  expect(status.state).toBe('down');
  expect(status.latencyMs).toEqual(expect.any(Number));
});

it('네트워크 오류나 타임아웃이면 throw하지 않고 down과 null 응답 시간을 준다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));

  const status = await checkServerStatus(server);

  expect(status).toMatchObject({ state: 'down', latencyMs: null });
});

it('타임아웃은 3초다', () => {
  expect(HEALTH_CHECK_TIMEOUT_MS).toBe(3000);
});

import type { MonitoredServer, ServerStatus } from '../model/serverStatus';

const HEALTH_PATH = '/v1/health';
export const HEALTH_CHECK_TIMEOUT_MS = 3000;

// 서버 하나의 상태를 잰다. 실패도 결과값으로 돌려주고 throw하지 않는다.
// 응답 속도는 fetch 앞뒤만 재므로 화면 렌더링 시간은 들어가지 않는다.
export const checkServerStatus = async ({
  id,
  label,
  baseUrl,
}: MonitoredServer): Promise<ServerStatus> => {
  const url = `${baseUrl.replace(/\/+$/, '')}${HEALTH_PATH}`;
  const startedAt = performance.now();

  try {
    // 측정값이 캐시된 응답이 되지 않도록 항상 새로 요청한다.
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - startedAt);

    // 본문은 쓰지 않는다. 읽지 않은 본문이 연결을 붙잡지 않게 닫는다.
    await response.body?.cancel();

    return {
      id,
      label,
      state: response.ok ? 'up' : 'down',
      latencyMs,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return { id, label, state: 'down', latencyMs: null, checkedAt: new Date().toISOString() };
  }
};

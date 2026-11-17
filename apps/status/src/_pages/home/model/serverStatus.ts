export type ServerId = 'web' | 'openapi' | 'oauth-authorization' | 'oauth-resource';

export interface MonitoredServer {
  id: ServerId;
  label: string;
  baseUrl: string;
}

export interface ServerStatus {
  id: ServerId;
  label: string;
  state: 'up' | 'down';
  // 요청을 보내고 응답 헤더를 받기까지 걸린 시간이다. 응답을 받지 못했으면(타임아웃, 네트워크 오류) null이다.
  latencyMs: number | null;
  checkedAt: string;
}

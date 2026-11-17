import { env } from '@/shared/config';

import type { MonitoredServer } from '../model/serverStatus';

import 'server-only';

// 상태 화면에 표시하는 순서대로 둔다. 서버를 더하거나 빼면 env.ts, .env.example, CI·Playwright env도 함께 고친다.
export const MONITORED_SERVERS: MonitoredServer[] = [
  { id: 'web', label: 'Web', baseUrl: env.STATUS_WEB_BASE_URL },
  { id: 'openapi', label: 'OpenAPI', baseUrl: env.STATUS_OPENAPI_BASE_URL },
  {
    id: 'oauth-authorization',
    label: 'OAuth Authorization',
    baseUrl: env.STATUS_OAUTH_AUTHORIZATION_BASE_URL,
  },
  { id: 'oauth-resource', label: 'OAuth Resource', baseUrl: env.STATUS_OAUTH_RESOURCE_BASE_URL },
];

import {
  AppEnvSchema,
  AppUrlsEnvSchema,
  parseEnv,
  readAppUrlsEnv,
} from '@datagsm/core/shared/config';
import { z } from 'zod';

// 서버에서만 불러온다. 값은 브라우저에 전달되지 않으므로 클라이언트 코드에서 불러오면 검증에 실패한다.
// status 앱은 DataGSM API를 호출하지 않아 공통 변수(API_BASE_URL)를 받지 않는다.
// 상태를 확인할 서버의 base URL과 사이드바용 앱 주소를 받는다. URL 검증 규칙과 오류 메시지는 core 공통 스키마의 것을 그대로 쓴다.
const BaseUrlSchema = AppEnvSchema.shape.API_BASE_URL;

const StatusEnvSchema = z.object({
  STATUS_WEB_BASE_URL: BaseUrlSchema,
  STATUS_OPENAPI_BASE_URL: BaseUrlSchema,
  STATUS_OAUTH_AUTHORIZATION_BASE_URL: BaseUrlSchema,
  STATUS_OAUTH_RESOURCE_BASE_URL: BaseUrlSchema,
  // 사이드바에서 다른 앱으로 이동할 주소다.
  ...AppUrlsEnvSchema.shape,
});

export const env = parseEnv(StatusEnvSchema, {
  STATUS_WEB_BASE_URL: process.env.STATUS_WEB_BASE_URL,
  STATUS_OPENAPI_BASE_URL: process.env.STATUS_OPENAPI_BASE_URL,
  STATUS_OAUTH_AUTHORIZATION_BASE_URL: process.env.STATUS_OAUTH_AUTHORIZATION_BASE_URL,
  STATUS_OAUTH_RESOURCE_BASE_URL: process.env.STATUS_OAUTH_RESOURCE_BASE_URL,
  ...readAppUrlsEnv(process.env),
});

import { AppEnvSchema, AppUrlsEnvSchema, parseEnv } from '@datagsm/core/shared/config';

// 서버에서만 불러온다. API_BASE_URL은 브라우저에 전달되지 않으므로 클라이언트 코드에서 불러오면 검증에 실패한다.
// 공통 변수와 검증 규칙은 core의 AppEnvSchema에 있다. 이 앱 전용 변수는 AppEnvSchema.extend({...})로 더하고
// 아래 객체에 process.env 값을 함께 넘긴다.
// oauth는 사이드바가 없어 앱 주소 중 client 주소(APP_CLIENT_URL)만 받는다. 404의 'DataGSM으로 이동'이 쓴다.
export const env = parseEnv(
  AppEnvSchema.extend({ APP_CLIENT_URL: AppUrlsEnvSchema.shape.APP_CLIENT_URL }),
  {
    API_BASE_URL: process.env.API_BASE_URL,
    APP_CLIENT_URL: process.env.APP_CLIENT_URL,
  },
);

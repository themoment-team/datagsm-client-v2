import { z } from 'zod';

import { AppEnvSchema } from './appEnv';

// 로그인이 필요한 앱(client, admin)이 OAuth 인가 서버와 통신할 때 쓰는 값이다.
// client secret은 서버에서만 쓰며 브라우저에 보내지 않는다. 인가 서버 주소는 로그인 리다이렉트와
// SSO 로그아웃 주소로 브라우저에 드러나지만, 값은 서버에서 읽어 넘기므로 NEXT_PUBLIC_ 변수로 두지 않는다.
const BaseUrlSchema = AppEnvSchema.shape.API_BASE_URL;

const RequiredTextSchema = z
  .string({ error: '값이 없습니다. .env.example을 참고해 설정하세요.' })
  .min(1, {
    error: '값이 비어 있습니다.',
  });

export const OauthEnvSchema = z.object({
  OAUTH_AUTHORIZATION_BASE_URL: BaseUrlSchema,
  OAUTH_CLIENT_ID: RequiredTextSchema,
  OAUTH_CLIENT_SECRET: RequiredTextSchema,
});

export type OauthEnv = z.infer<typeof OauthEnvSchema>;

export const readOauthEnv = (source: Record<string, string | undefined>) => ({
  OAUTH_AUTHORIZATION_BASE_URL: source.OAUTH_AUTHORIZATION_BASE_URL,
  OAUTH_CLIENT_ID: source.OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET: source.OAUTH_CLIENT_SECRET,
});

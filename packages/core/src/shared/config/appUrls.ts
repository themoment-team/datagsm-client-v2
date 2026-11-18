import { z } from 'zod';

import { AppEnvSchema } from './appEnv';

// 사이드바로 서로 오가는 앱이다. admin과 oauth는 따로 쓰는 앱이라 넣지 않는다.
export type AppId = 'client' | 'docs' | 'status' | 'projects';

export type AppUrls = Record<AppId, string>;

// 앱마다 배포 주소가 달라서(로컬, Vercel 미리보기, 운영) 코드에 두지 않고 환경 변수로 받는다.
// URL 검증 규칙과 오류 메시지는 API_BASE_URL과 같다.
const AppUrlSchema = AppEnvSchema.shape.API_BASE_URL;

export const AppUrlsEnvSchema = z.object({
  APP_CLIENT_URL: AppUrlSchema,
  APP_DOCS_URL: AppUrlSchema,
  APP_STATUS_URL: AppUrlSchema,
  APP_PROJECTS_URL: AppUrlSchema,
});

export type AppUrlsEnv = z.infer<typeof AppUrlsEnvSchema>;

// 앱이 process.env 값을 모을 때 쓴다. 변수 이름을 앱마다 다시 적지 않게 한다.
export const readAppUrlsEnv = (source: Record<string, string | undefined>) => ({
  APP_CLIENT_URL: source.APP_CLIENT_URL,
  APP_DOCS_URL: source.APP_DOCS_URL,
  APP_STATUS_URL: source.APP_STATUS_URL,
  APP_PROJECTS_URL: source.APP_PROJECTS_URL,
});

// 끝의 /는 떼어 둔다. 링크는 주소 뒤에 /로 시작하는 경로를 붙여 만든다.
export const toAppUrls = (env: AppUrlsEnv): AppUrls => {
  const trim = (url: string) => url.replace(/\/+$/, '');

  return {
    client: trim(env.APP_CLIENT_URL),
    docs: trim(env.APP_DOCS_URL),
    status: trim(env.APP_STATUS_URL),
    projects: trim(env.APP_PROJECTS_URL),
  };
};

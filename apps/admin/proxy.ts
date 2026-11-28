import { createAuthProxy } from '@datagsm/core/shared/auth/server';

import { env } from '@/shared/config';

// 로그인이 필요한 경로만 적는다(allowlist). 새 보호 페이지를 만들면 여기에 더한다.
// /backend/*는 쿠키의 토큰을 Authorization 헤더로 옮기기 위해 거친다.
// access token이 만료됐으면 refresh token으로 먼저 갱신한다.
export const proxy = createAuthProxy(env);

export const config = {
  matcher: [
    '/backend/:path*',
    '/students/:path*',
    '/info-change-reviews/:path*',
    '/accounts/:path*',
    '/teacher-approvals/:path*',
    '/clubs/:path*',
    '/projects/:path*',
    '/project-reviews/:path*',
    '/api-keys/:path*',
  ],
};

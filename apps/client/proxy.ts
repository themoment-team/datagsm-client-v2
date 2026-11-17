import { authProxy } from '@datagsm/core/shared/auth/server';

// 로그인이 필요한 경로만 적는다(allowlist). 새 보호 페이지를 만들면 여기에 더한다.
// /backend/*는 쿠키의 토큰을 Authorization 헤더로 옮기기 위해 거친다.
export const proxy = authProxy;

export const config = {
  matcher: [
    '/backend/:path*',
    '/applications/:path*',
    '/clients/:path*',
    '/api-keys/:path*',
    '/events/:path*',
    '/me/:path*',
  ],
};

import { cookies } from 'next/headers';

import type { AxiosInstance } from 'axios';

import { ACCESS_TOKEN_COOKIE } from './authCookies';

// 서버(RSC, Server Function)에서 보내는 API 요청에 요청자의 토큰을 붙인다.
// 브라우저 요청은 proxy가 붙이므로 서버 인스턴스에만 쓴다.
export const withAccessToken = (instance: AxiosInstance) => {
  instance.interceptors.request.use(async (config) => {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  });

  return instance;
};

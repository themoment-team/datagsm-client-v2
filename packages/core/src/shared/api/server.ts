import { cookies } from 'next/headers';

import axios from 'axios';

import 'server-only';
import { API_BASE_URL } from '../config/env';
import { COOKIE_KEYS } from '../config/auth';

export const serverAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

serverAxiosInstance.interceptors.request.use(async (config) => {
  const token = (await cookies()).get(COOKIE_KEYS.ACCESS_TOKEN)?.value;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ponytail: 서버에서는 토큰 갱신 안 함 — 일반 모듈에서 쿠키 쓰기가 불가능해서
// 갱신해도 브라우저에 반영이 안 됨. 401은 그대로 던지고 클라이언트가 갱신을 맡음.
// Server Action에서 갱신이 필요해지면 그때 cookies().set()으로 확장할 것.
serverAxiosInstance.interceptors.response.use((response) => response.data);

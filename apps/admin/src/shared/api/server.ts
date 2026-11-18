import { createApiInstance } from '@datagsm/core/shared/api';
import { withAccessToken } from '@datagsm/core/shared/auth/server';

import { env } from '@/shared/config';

import 'server-only';

// 요청한 사용자의 토큰 쿠키를 Authorization 헤더로 붙인다.
export const serverAxiosInstance = withAccessToken(createApiInstance(env.API_BASE_URL));

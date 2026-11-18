import { createApiInstance, setOnUnauthorized } from '@datagsm/core/shared/api';
import { redirectToLogin } from '@datagsm/core/shared/auth';

export const axiosInstance = createApiInstance('/backend');

// 브라우저에서 401을 받으면 로그인을 다시 시작한다. 서버 렌더링 중에는 등록하지 않는다.
if (typeof window !== 'undefined') {
  setOnUnauthorized(redirectToLogin);
}

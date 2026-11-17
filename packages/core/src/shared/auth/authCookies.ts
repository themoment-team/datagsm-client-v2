// 이 앱 도메인에만 저장하는 httpOnly 쿠키다(host-only). 다른 서브도메인 앱과 공유하지 않는다.
export const ACCESS_TOKEN_COOKIE = 'datagsm_at';

// 로그인 시작부터 콜백까지 state·PKCE verifier·돌아갈 경로를 들고 있는 임시 쿠키다.
export const LOGIN_FLOW_COOKIE = 'datagsm_login';
export const LOGIN_FLOW_MAX_AGE_SECONDS = 600;

export const LOGIN_PATH = '/api/login';
export const CALLBACK_PATH = '/api/callback';

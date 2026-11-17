// 이 앱 도메인에만 저장하는 httpOnly 쿠키다(host-only). 다른 서브도메인 앱과 공유하지 않는다.
export const ACCESS_TOKEN_COOKIE = 'datagsm_at';
export const REFRESH_TOKEN_COOKIE = 'datagsm_rt';

// access token 쿠키는 실제 만료보다 이만큼 먼저 사라지게 둔다. 쿠키가 없고 refresh token이 있으면
// proxy가 갱신하므로, 요청이 백엔드에 닿기 전에 토큰이 만료되는 일을 줄인다.
export const ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS = 60;

// 인가 서버의 refresh token 수명(30일)이다. token 응답에 수명이 없어 문서 값을 쓴다.
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

// 로그인 시작부터 콜백까지 state·PKCE verifier·돌아갈 경로를 들고 있는 임시 쿠키다.
export const LOGIN_FLOW_COOKIE = 'datagsm_login';
export const LOGIN_FLOW_MAX_AGE_SECONDS = 600;

export const LOGIN_PATH = '/api/login';
export const CALLBACK_PATH = '/api/callback';

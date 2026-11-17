import { LOGIN_PATH } from './authCookies';

// 브라우저 요청이 401을 받으면 지금 화면으로 돌아오도록 로그인을 다시 시작한다.
// 인가 서버의 로그인 세션이 남아 있으면 비밀번호 입력 없이 바로 돌아온다.
export const redirectToLogin = () => {
  const returnTo = `${window.location.pathname}${window.location.search}`;

  window.location.assign(`${LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`);
};

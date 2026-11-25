import { DEFAULT_THEME, THEME_COOKIE, THEMES } from './theme';

// 화면을 그리기 전에 쿠키의 테마를 <html data-theme>에 붙이는 인라인 스크립트다.
// React가 hydration하기 전에 실행되어야 깜빡임이 없으므로 번들이 아니라 문자열로 HTML에 넣는다.
// 다른 앱이나 탭에서 테마를 바꾸고 돌아오면(visibilitychange) 쿠키를 다시 읽어 맞춘다.
// 값은 THEMES에 있는 것만 받고, 그 밖의 값이나 쿠키가 없으면 기본 테마를 쓴다.
export const THEME_SCRIPT = `(() => {
  const themes = ${JSON.stringify(THEMES)};
  const apply = () => {
    const match = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);
    const theme = match && themes.includes(match[1]) ? match[1] : ${JSON.stringify(DEFAULT_THEME)};
    if (document.documentElement.dataset.theme !== theme) document.documentElement.dataset.theme = theme;
  };
  apply();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) apply();
  });
})();`;

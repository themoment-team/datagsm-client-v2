import { THEME_SCRIPT } from '../model/themeScript';

// 모든 앱의 루트 layout이 <body> 바로 안에서 감싼다.
// 테마 선택은 앱끼리 공유하는 쿠키에 있고(model/theme.ts), 아래 스크립트가 그리기 전에 <html data-theme>을 맞춘다.
// shared-styles.css가 [data-theme='dark']에서 색 토큰을 바꾼다. 기본은 Light다.
// 스크립트가 hydration 전에 <html> 속성을 바꾸므로 루트 layout의 <html>에 suppressHydrationWarning이 필요하다.
// 서버 컴포넌트로 두어 스크립트가 서버 HTML에만 들어가게 한다. 클라이언트 컴포넌트가 <script>를 그리면 React는 실행하지 않고 경고한다.
export const ThemeProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
    {children}
  </>
);

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

// 모든 앱이 같은 테마 설정을 쓰도록 core가 next-themes 옵션을 정한다.
// - shared-styles.css가 [data-theme='dark']에서 색 토큰을 바꾸므로 attribute는 data-theme이다.
// - 기본은 Light다(디자인 결정). OS 설정은 따르지 않는다.
// - 선택값은 이 앱 주소의 localStorage에 남으므로 서브도메인(앱)마다 따로 저장된다.
// next-themes가 화면을 그리기 전에 <html>에 속성을 붙이므로 루트 layout의 <html>에 suppressHydrationWarning이 필요하다.
export const ThemeProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <NextThemesProvider
    attribute="data-theme"
    themes={['light', 'dark']}
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    {children}
  </NextThemesProvider>
);

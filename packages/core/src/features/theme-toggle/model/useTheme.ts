'use client';

import { useSyncExternalStore } from 'react';

import { isTheme, setTheme, type Theme } from './theme';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};

const getSnapshot = (): Theme | undefined => {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : undefined;
};

// 서버는 사용자의 테마를 모르므로 undefined다. hydration이 끝나면 <html data-theme> 값으로 바뀐다.
// undefined일 때 현재 테마를 화면에 표시하면 서버 HTML과 달라져 hydration 경고가 나므로 표시하지 않는다.
const getServerSnapshot = () => undefined;

// 현재 테마와 바꾸는 함수를 준다. 다른 곳(인라인 스크립트, 다른 컴포넌트)에서 바꿔도 따라간다.
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, setTheme };
};

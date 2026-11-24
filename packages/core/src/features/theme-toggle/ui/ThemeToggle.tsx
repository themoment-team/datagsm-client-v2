'use client';

import { useSyncExternalStore } from 'react';

import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
}

const subscribe = () => () => {};

// 서버 렌더링과 hydration 중에는 false, 그 뒤에는 true다.
// 서버는 저장된 테마를 모르므로 이 값이 true가 되기 전에는 현재 테마를 표시하지 않는다.
// 처음부터 현재 테마로 그리면 서버 HTML과 달라져 hydration 경고가 난다.
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// Light와 Dark를 오간다. 상태는 aria-pressed로 알린다(눌림 = Dark).
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useIsHydrated();
  const isDark = isHydrated && resolvedTheme === 'dark';

  const handleClick = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className={className}
      aria-pressed={isHydrated ? isDark : undefined}
      onClick={handleClick}
    >
      다크 모드
    </button>
  );
};

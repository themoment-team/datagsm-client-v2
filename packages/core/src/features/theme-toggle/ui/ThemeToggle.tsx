'use client';

import { useTheme } from '../model/useTheme';

interface ThemeToggleProps {
  className?: string;
}

// Light와 Dark를 오간다. 상태는 aria-pressed로 알린다(눌림 = Dark).
// 서버 렌더링과 hydration 중에는 테마를 모르므로(undefined) aria-pressed를 붙이지 않는다.
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className={className}
      aria-pressed={theme === undefined ? undefined : isDark}
      onClick={handleClick}
    >
      다크 모드
    </button>
  );
};

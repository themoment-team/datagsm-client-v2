import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { THEME_SCRIPT } from '../model/themeScript';
import { ThemeToggle } from './ThemeToggle';

// 브라우저에서는 서버 HTML의 인라인 스크립트가 hydration 전에 실행된다. jsdom에서는 직접 실행한다.

const runThemeScript = () => new Function(THEME_SCRIPT)() as void;

const clearThemeCookie = () => {
  document.cookie = 'theme=; Path=/; Max-Age=0';
};

afterEach(() => {
  clearThemeCookie();
  document.documentElement.removeAttribute('data-theme');
});

it('쿠키가 없으면 Light로 시작하고 누르면 Dark로 바꿔 쿠키에 저장한다', async () => {
  runThemeScript();
  render(<ThemeToggle />);
  const button = screen.getByRole('button', { name: '다크 모드' });

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(button).toHaveAttribute('aria-pressed', 'false');

  fireEvent.click(button);

  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(document.cookie).toContain('theme=dark');
});

it('쿠키에 저장된 테마로 시작하고 다시 누르면 Light로 돌아간다', async () => {
  document.cookie = 'theme=dark; Path=/';
  runThemeScript();
  render(<ThemeToggle />);
  const button = screen.getByRole('button', { name: '다크 모드' });

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(button).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(button);

  await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
  expect(document.cookie).toContain('theme=light');
});

it('light·dark가 아닌 쿠키 값은 무시하고 Light를 쓴다', () => {
  document.cookie = 'theme=<script>; Path=/';
  runThemeScript();

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});

it('다른 앱에서 바꾼 테마를 화면으로 돌아올 때 따라간다', async () => {
  runThemeScript();
  render(<ThemeToggle />);
  const button = screen.getByRole('button', { name: '다크 모드' });
  expect(button).toHaveAttribute('aria-pressed', 'false');

  // 다른 서브도메인 앱이 같은 쿠키를 dark로 바꾼 상황이다.
  document.cookie = 'theme=dark; Path=/';
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

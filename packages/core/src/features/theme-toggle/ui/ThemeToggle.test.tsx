import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

beforeEach(() => {
  // jsdom에는 matchMedia가 없다. next-themes가 OS 설정 변화를 구독할 때 부른다.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

it('기본은 Light이고 누르면 Dark로 바꿔 저장한다', async () => {
  renderToggle();
  const button = screen.getByRole('button', { name: '다크 모드' });

  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');

  fireEvent.click(button);

  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(localStorage.getItem('theme')).toBe('dark');
});

it('저장된 테마로 시작하고 다시 누르면 Light로 돌아간다', async () => {
  localStorage.setItem('theme', 'dark');
  renderToggle();
  const button = screen.getByRole('button', { name: '다크 모드' });

  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));

  fireEvent.click(button);

  await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
});

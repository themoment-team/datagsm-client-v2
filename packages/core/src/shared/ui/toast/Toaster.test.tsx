import { act, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';

import { toast } from './toast';
import { Toaster } from './Toaster';

afterEach(() => {
  act(() => {
    toast.close();
  });
  document.documentElement.removeAttribute('data-theme');
});

const getViewport = () => screen.getByRole('region', { name: '알림' });

it('toast()를 부르면 Toaster 안에 제목과 내용이 나타나고 close로 닫힌다', async () => {
  render(<Toaster />);

  let id = '';
  act(() => {
    id = toast('API 키를 복사했습니다', { description: '클립보드에 넣었습니다' });
  });

  const title = await screen.findByText('API 키를 복사했습니다');
  expect(getViewport()).toContainElement(title);
  expect(screen.getByText('클립보드에 넣었습니다')).toBeInTheDocument();

  act(() => {
    toast.close(id);
  });

  await waitFor(() => expect(screen.queryByText('API 키를 복사했습니다')).not.toBeInTheDocument());
});

it('여러 번 부르면 새 토스트를 앞에 두고 쌓는다', async () => {
  render(<Toaster />);

  act(() => {
    toast('첫 번째');
    toast('두 번째');
  });

  await screen.findByText('두 번째');
  const titles = screen.getAllByRole('heading').map((heading) => heading.textContent);
  expect(titles).toEqual(['두 번째', '첫 번째']);
});

it.each([
  ['light', 'dark'],
  ['dark', 'light'],
])('%s 화면에서는 토스트 영역을 %s로 그린다', async (screenTheme, toastTheme) => {
  document.documentElement.dataset.theme = screenTheme;
  render(<Toaster />);

  act(() => {
    toast('알림');
  });

  await screen.findByText('알림');
  expect(getViewport()).toHaveAttribute('data-theme', toastTheme);
});

it('화면 테마가 바뀌면 토스트 영역도 반대로 따라간다', async () => {
  document.documentElement.dataset.theme = 'light';
  render(<Toaster />);
  act(() => {
    toast('알림');
  });
  await screen.findByText('알림');

  document.documentElement.dataset.theme = 'dark';

  await waitFor(() => expect(getViewport()).toHaveAttribute('data-theme', 'light'));
});

// 다크 화면 안의 토스트는 [data-theme='light'] 블록으로 Light 색을 되돌린다.
// @theme의 Light 값을 고치고 이 블록을 빼먹으면 다크 화면의 토스트만 옛 색으로 남는다.
it("[data-theme='light'] 블록이 @theme의 색 토큰을 같은 값으로 되돌린다", () => {
  // jsdom 환경에서는 import.meta.url이 file: 주소가 아니어서 dirname으로 경로를 만든다.
  const css = readFileSync(
    resolve(import.meta.dirname, '../../../../../tailwind-config/shared-styles.css'),
    'utf8',
  );
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    expect(start, `${selector} 블록이 없습니다.`).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('\n}', start));
  };
  const colors = (source: string) =>
    [...source.matchAll(/--color-([a-z0-9-]+): ([^;]+);/g)]
      .filter(([, name]) => name !== '*')
      .map(([, name, value]) => `${name}: ${value}`)
      .sort();

  const light = colors(block('@theme'));

  expect(light.length).toBeGreaterThan(0);
  expect(colors(block("[data-theme='light']"))).toEqual(light);
});

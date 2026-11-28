import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { NotFoundCard } from './NotFoundCard';
import { NotFoundLink } from './NotFoundLink';
import { NotFoundPane } from './NotFoundPane';

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

it('본문 칸은 404 안내와 주 버튼, 이전 페이지 버튼을 그린다', () => {
  render(<NotFoundPane homeLabel="학생 관리로 이동" homeHref="/students" />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(
    screen.getByText('주소가 바뀌었거나 삭제된 페이지입니다. 주소를 확인하세요.'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '학생 관리로 이동' })).toHaveAttribute(
    'href',
    '/students',
  );
});

it('이전 페이지는 기록이 없으면 주 버튼과 같은 곳으로 이동한다', () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
  render(<NotFoundPane homeLabel="애플리케이션으로 이동" homeHref="/applications" />);
  // jsdom의 첫 기록 하나뿐이라 돌아갈 곳이 없다.
  expect(window.history.length).toBe(1);

  const link = screen.getByRole('link', { name: '이전 페이지' });
  // fireEvent는 기본 동작을 막지 않았으면 true를 준다. 막지 않았으므로 href로 이동한다.
  expect(fireEvent.click(link)).toBe(true);
  expect(link).toHaveAttribute('href', '/applications');
  expect(back).not.toHaveBeenCalled();
});

it('이전 페이지는 기록이 있으면 링크 이동을 막고 뒤로 간다', () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
  window.history.pushState(null, '', '/previous');
  render(<NotFoundPane homeLabel="애플리케이션으로 이동" homeHref="/applications" />);

  expect(fireEvent.click(screen.getByRole('link', { name: '이전 페이지' }))).toBe(false);
  expect(back).toHaveBeenCalledTimes(1);
});

it('가운데 카드는 브랜드, 404 제목, 안내 문구와 children을 그린다', () => {
  render(
    <NotFoundCard title="서비스를 찾을 수 없습니다" description="서비스 관리자에게 문의하세요.">
      <p>client_id dg_123</p>
    </NotFoundCard>,
  );

  expect(screen.getByText('DATA GSM')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { level: 1, name: '서비스를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByText('서비스 관리자에게 문의하세요.')).toBeInTheDocument();
  expect(screen.getByText('client_id dg_123')).toBeInTheDocument();
});

it('이동 링크는 앱 안 경로와 다른 앱 주소를 모두 그 주소로 연결한다', () => {
  render(
    <>
      <NotFoundLink href="/" className="">
        앱 안
      </NotFoundLink>
      <NotFoundLink href="https://datagsm.kr" className="">
        다른 앱
      </NotFoundLink>
    </>,
  );

  expect(screen.getByRole('link', { name: '앱 안' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: '다른 앱' })).toHaveAttribute(
    'href',
    'https://datagsm.kr',
  );
});

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { LandingNotFoundPage } from './LandingNotFoundPage';

it('사이드바 없는 카드 404를 렌더하고 랜딩으로 보낸다', () => {
  render(<LandingNotFoundPage />);

  expect(
    screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'DataGSM으로 이동' })).toHaveAttribute('href', '/');
  expect(screen.queryByRole('link', { name: '이전 페이지' })).not.toBeInTheDocument();
});

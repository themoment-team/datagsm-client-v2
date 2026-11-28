import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { NotFoundPage } from './NotFoundPage';

it('404 안내와 애플리케이션으로 이동, 이전 페이지 버튼을 렌더한다', () => {
  render(<NotFoundPage clientUrl="https://datagsm.kr" />);

  expect(
    screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '애플리케이션으로 이동' })).toHaveAttribute(
    'href',
    'https://datagsm.kr/applications',
  );
  expect(screen.getByRole('link', { name: '이전 페이지' })).toHaveAttribute(
    'href',
    'https://datagsm.kr/applications',
  );
});

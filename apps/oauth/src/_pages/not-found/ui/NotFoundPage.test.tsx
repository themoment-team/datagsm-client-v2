import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { NotFoundPage } from './NotFoundPage';

it('404 카드를 렌더하고 DataGSM(client 앱)으로 보낸다', () => {
  render(<NotFoundPage clientUrl="https://datagsm.kr" />);

  expect(
    screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(
    screen.getByText('주소를 확인하세요. 로그인은 사용하던 서비스에서 다시 시작하세요.'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'DataGSM으로 이동' })).toHaveAttribute(
    'href',
    'https://datagsm.kr',
  );
});

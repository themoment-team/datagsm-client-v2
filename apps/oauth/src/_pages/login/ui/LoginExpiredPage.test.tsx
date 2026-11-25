import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { LoginExpiredPage } from './LoginExpiredPage';

it('만료 제목과 안내 문구만 그리고 폼은 없다', () => {
  render(<LoginExpiredPage />);

  expect(
    screen.getByRole('heading', { level: 1, name: '인증 세션이 만료되었습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText(/보안을 위해 인증 세션을 끝냈습니다\./)).toHaveTextContent(
    '이 창을 닫고 서비스에서 다시 로그인하세요.',
  );
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

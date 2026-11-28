import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { UnregisteredServicePage } from './UnregisteredServicePage';

it('등록되지 않은 서비스 안내와 요청한 client_id를 보여 주고 이동 버튼은 없다', () => {
  render(<UnregisteredServicePage clientId="dg_7f3a9c2e41b8" />);

  expect(
    screen.getByRole('heading', { level: 1, name: '서비스를 찾을 수 없습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByText('dg_7f3a9c2e41b8')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

it('client_id는 마크업이 아니라 글자로만 보여 준다', () => {
  render(<UnregisteredServicePage clientId="<b>x</b>" />);

  expect(screen.getByText('<b>x</b>')).toBeInTheDocument();
});

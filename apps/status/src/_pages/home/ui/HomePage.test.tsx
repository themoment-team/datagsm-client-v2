import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { HomePage } from './HomePage';

// 상태 목록은 서버에서 env를 읽고 외부 서버를 호출한다. 단위 테스트에서는 빈 컴포넌트로 바꾼다.
vi.mock('./ServerStatusList', () => ({ ServerStatusList: () => null }));

it('HomePage가 heading을 렌더한다', () => {
  render(<HomePage />);

  expect(screen.getByRole('heading', { level: 1, name: 'DataGSM Status' })).toBeInTheDocument();
});

import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ScopeList } from './ScopeList';

const scopes = [
  { id: 'self:read', label: '내 정보 읽기' },
  { id: 'email:read', label: '이메일 읽기' },
];

it('권한마다 목록 항목 하나를 라벨과 함께 그린다', () => {
  render(<ScopeList scopes={scopes} />);

  const items = within(screen.getByRole('list')).getAllByRole('listitem');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('내 정보 읽기');
  expect(items[1]).toHaveTextContent('이메일 읽기');
});

it('체크 아이콘은 장식이라 스크린 리더에서 숨긴다', () => {
  render(<ScopeList scopes={scopes} />);

  const [item] = screen.getAllByRole('listitem');
  expect(item?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByRole('img')).toBeNull();
});

it('최대 높이 280에서 세로로 스크롤한다', () => {
  render(<ScopeList scopes={scopes} />);

  expect(screen.getByRole('list')).toHaveClass('max-h-70', 'overflow-y-auto');
});

it('권한이 없으면 빈 목록이다', () => {
  render(<ScopeList scopes={[]} />);

  expect(screen.getByRole('list')).toBeEmptyDOMElement();
});

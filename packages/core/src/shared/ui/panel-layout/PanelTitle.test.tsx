import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { PanelTitle } from './PanelTitle';

it('제목은 기본이 h2이고 title-32 스타일이며, id로 칸 이름에 연결할 수 있다', () => {
  render(<PanelTitle id="students-title">학생 관리</PanelTitle>);

  const heading = screen.getByRole('heading', { level: 2, name: '학생 관리' });
  expect(heading).toHaveAttribute('id', 'students-title');
  expect(heading).toHaveClass('text-title-32');
});

it('화면의 대표 제목은 h1로 바꿀 수 있다', () => {
  render(<PanelTitle as="h1">내 정보</PanelTitle>);

  expect(screen.getByRole('heading', { level: 1, name: '내 정보' })).toBeInTheDocument();
});

it('배지는 제목 옆(간격 8)에, 버튼은 같은 줄 오른쪽(간격 16)에 놓이고 버튼은 위쪽에 맞춘다', () => {
  render(
    <PanelTitle adornment={<span>대기</span>} actions={<button>추가</button>}>
      학생 관리
    </PanelTitle>,
  );

  const titleGroup = screen.getByRole('heading').parentElement!;
  expect(titleGroup).toContainElement(screen.getByText('대기'));
  expect(titleGroup).toHaveClass('flex-1', 'gap-2', 'items-center');

  const actions = screen.getByRole('button', { name: '추가' }).parentElement!;
  expect(actions).toHaveClass('shrink-0', 'gap-4');
  expect(actions.parentElement).toBe(titleGroup.parentElement);
  expect(actions.parentElement).toHaveClass('flex', 'items-start', 'gap-4');
});

it('버튼이 없으면 버튼 자리를 그리지 않는다', () => {
  const { container } = render(<PanelTitle>문서</PanelTitle>);

  expect(container.firstElementChild?.children).toHaveLength(1);
});

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ScrollArea } from './ScrollArea';

it('className은 바깥 틀에, contentClassName은 내용 상자에 붙는다', () => {
  render(
    <ScrollArea className="max-h-[280px]" contentClassName="p-6">
      <p>내용</p>
    </ScrollArea>,
  );

  const content = screen.getByText('내용').parentElement;
  expect(content).toHaveClass('p-6');
  // 내용 상자 → Viewport → 바깥 틀
  expect(content?.parentElement?.parentElement).toHaveClass('max-h-[280px]', 'flex', 'flex-col');
});

it('Viewport가 바깥 틀의 남은 높이를 채워서 max-h만 줘도 그 높이에서 스크롤된다', () => {
  render(
    <ScrollArea>
      <p>내용</p>
    </ScrollArea>,
  );

  const viewport = screen.getByText('내용').parentElement?.parentElement;
  expect(viewport).toHaveClass('min-h-0', 'flex-1');
  // 끝에 닿은 휠이 바깥 스크롤 영역으로 이어지도록 스크롤 이어짐을 막지 않는다.
  expect(viewport?.className).not.toMatch(/overscroll/);
});

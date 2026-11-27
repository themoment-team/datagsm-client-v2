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

it.each([
  ['vertical', 'overflow-x-hidden!'],
  ['horizontal', 'overflow-y-hidden!'],
] as const)('%s만 고르면 다른 축은 스크롤되지 않게 막는다', (orientation, blocked) => {
  render(
    <ScrollArea orientation={orientation}>
      <p>내용</p>
    </ScrollArea>,
  );

  expect(screen.getByText('내용').parentElement?.parentElement).toHaveClass(blocked);
});

it('both면 두 축 모두 스크롤된다', () => {
  render(
    <ScrollArea orientation="both">
      <p>내용</p>
    </ScrollArea>,
  );

  const viewport = screen.getByText('내용').parentElement?.parentElement;
  expect(viewport).not.toHaveClass('overflow-x-hidden!');
  expect(viewport).not.toHaveClass('overflow-y-hidden!');
});

it('세로 영역은 내용 상자를 영역 폭에 맞춰 긴 내용이 잘리지 않고 줄바꿈·말줄임이 된다', () => {
  render(
    <ScrollArea>
      <p>내용</p>
    </ScrollArea>,
  );

  // Base UI Content의 인라인 min-width: fit-content를 덮는다.
  expect(screen.getByText('내용').parentElement).toHaveClass('min-w-0!');
});

it('가로로 스크롤되는 영역은 내용 상자가 넘친 폭만큼 넓어질 수 있다', () => {
  render(
    <ScrollArea orientation="both">
      <p>내용</p>
    </ScrollArea>,
  );

  expect(screen.getByText('내용').parentElement).not.toHaveClass('min-w-0!');
});

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ScrollArea } from './ScrollArea';

it('children을 그리고 className을 바깥 요소에 붙인다', () => {
  const { container } = render(
    <ScrollArea className="max-h-70">
      <p>내용</p>
    </ScrollArea>,
  );

  expect(screen.getByText('내용')).toBeInTheDocument();
  expect(container.firstElementChild).toHaveClass('max-h-70');
});

// jsdom에는 레이아웃이 없어 내용이 넘치지 않은 상태로 본다. 막대 표시는 브라우저에서 확인했다.
it('내용이 넘치지 않으면 스크롤바를 그리지 않고 viewport를 tab 순서에서 뺀다', () => {
  render(
    <ScrollArea>
      <p>내용</p>
    </ScrollArea>,
  );

  const viewport = screen.getByText('내용').parentElement;
  expect(viewport).toHaveAttribute('tabindex', '-1');
  expect(document.querySelector('[data-orientation="vertical"]')).toBeNull();
});

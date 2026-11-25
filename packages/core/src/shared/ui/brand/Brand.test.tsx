import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Brand } from './Brand';
import { Logo } from './Logo';

it('로고와 DATA GSM 글자를 보여 주고, 로고는 스크린 리더에서 숨긴다', () => {
  const { container } = render(<Brand />);

  expect(screen.getByText('DATA GSM')).toHaveClass('text-brand-16', 'text-foreground');
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByRole('img')).toBeNull();
});

it('padding 기본값은 16(px-4)이고 none이면 좌우 여백이 없다', () => {
  const { container, rerender } = render(<Brand />);
  expect(container.firstChild).toHaveClass('px-4');

  rerender(<Brand padding="none" />);
  expect(container.firstChild).not.toHaveClass('px-4');
});

it('로고는 글자색을 따르고, 단독으로 쓸 때 aria-label로 이름을 붙인다', () => {
  render(<Logo aria-label="DataGSM" />);

  const logo = screen.getByRole('img', { name: 'DataGSM' });
  expect(logo).toHaveAttribute('fill', 'currentColor');
  expect(logo).toHaveClass('text-foreground');
});

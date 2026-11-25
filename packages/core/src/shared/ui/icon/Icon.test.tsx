import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { CheckIcon, MailIcon } from './icons';
import * as icons from './index';

const iconComponents = Object.entries(icons).filter(([name]) => name.endsWith('Icon'));

it('Figma WF/Icons의 아이콘 37개를 모두 내보낸다', () => {
  expect(iconComponents).toHaveLength(37);
});

it.each(iconComponents)(
  '%s는 16px viewBox에 path를 그리고 색은 currentColor를 따른다',
  (_, Component) => {
    const { container } = render(<Component />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg?.querySelector('path')).not.toBeNull();
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}/i);
  },
);

it('기본은 장식 아이콘으로 스크린 리더에서 숨긴다', () => {
  const { container } = render(<CheckIcon />);
  const svg = container.querySelector('svg');

  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('focusable', 'false');
  expect(svg).not.toHaveAttribute('role');
});

it('aria-label을 주면 이름 있는 이미지가 된다', () => {
  render(<CheckIcon aria-label="완료" />);

  const svg = screen.getByRole('img', { name: '완료' });
  expect(svg).not.toHaveAttribute('aria-hidden');
});

it('기본 크기는 size-4이고 className으로 크기와 색을 바꾼다', () => {
  const { container, rerender } = render(<CheckIcon />);
  expect(container.querySelector('svg')).toHaveClass('size-4');

  rerender(<CheckIcon className="size-5 text-foreground-muted" />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveClass('size-5', 'text-foreground-muted');
  expect(svg).not.toHaveClass('size-4');
});

it('선 아이콘은 stroke, 면 아이콘(mail)은 fill로 currentColor를 쓴다', () => {
  const { container, rerender } = render(<CheckIcon />);
  expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');

  rerender(<MailIcon />);
  expect(container.querySelector('path')).toHaveAttribute('fill', 'currentColor');
  expect(container.querySelector('path')).toHaveAttribute('stroke', 'none');
});

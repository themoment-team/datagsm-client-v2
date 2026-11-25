import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ChevronLeftIcon } from '../icon';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('aria-label을 이름으로 쓰고 기본 type은 button이라 form을 제출하지 않는다', () => {
    const handleSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <IconButton aria-label="관련 문서 접기">
          <ChevronLeftIcon />
        </IconButton>
      </form>,
    );
    const button = screen.getByRole('button', { name: '관련 문서 접기' });

    fireEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('누르면 onClick을 부른다', () => {
    const handleClick = vi.fn();
    render(
      <IconButton aria-label="닫기" onClick={handleClick}>
        <ChevronLeftIcon />
      </IconButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disabled면 누를 수 없다', () => {
    const handleClick = vi.fn();
    render(
      <IconButton aria-label="닫기" disabled onClick={handleClick}>
        <ChevronLeftIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: '닫기' });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('아이콘을 그리고 장식으로 숨긴다', () => {
    const { container } = render(
      <IconButton aria-label="닫기">
        <ChevronLeftIcon />
      </IconButton>,
    );
    const icon = container.querySelector('svg');

    expect(screen.getByRole('button', { name: '닫기' })).toContainElement(icon);
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // Figma WF/Icon button의 크기·모서리·아이콘 색·Hover 칠
  it('Figma 모양 클래스를 쓰고 className을 덧붙인다', () => {
    render(
      <IconButton aria-label="닫기" className="ml-auto text-foreground">
        <ChevronLeftIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button');

    expect(button).toHaveClass(
      'size-8',
      'rounded',
      'not-disabled:hover:bg-hover',
      'disabled:text-foreground-muted',
      '[&_svg]:size-4',
      'ml-auto',
      'text-foreground',
    );
    expect(button).not.toHaveClass('text-foreground-muted');
  });

  it('aria-label이 없으면 타입 오류다', () => {
    // @ts-expect-error 아이콘만 있는 버튼은 aria-label이 필수다.
    render(<IconButton>아이콘</IconButton>);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

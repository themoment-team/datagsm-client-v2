import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('children을 이름으로 그리고 기본 type은 button이다', () => {
    render(<Button>저장</Button>);

    expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute('type', 'button');
  });

  it('type="submit"이면 form을 제출한다', () => {
    const handleSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">제출</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('disabled면 누를 수 없다', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        삭제
      </Button>,
    );
    const button = screen.getByRole('button', { name: '삭제' });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Figma WF/Button의 Style별 Default·Hover·Disabled 칠과 글자색
  it.each([
    {
      variant: 'primary',
      classes: [
        'bg-strong',
        'text-on-strong',
        'from-hover-on-strong',
        'to-hover-on-strong',
        'not-disabled:hover:bg-linear-to-r',
        'disabled:bg-subtle',
        'disabled:text-foreground-muted',
      ],
    },
    {
      variant: 'secondary',
      classes: [
        'bg-subtle',
        'text-foreground',
        'from-hover',
        'to-hover',
        'not-disabled:hover:bg-linear-to-r',
        'disabled:text-foreground-muted',
      ],
    },
    {
      variant: 'ghost',
      classes: ['text-foreground', 'not-disabled:hover:bg-hover', 'disabled:text-foreground-muted'],
    },
  ] as const)('$variant 변형의 색 토큰을 쓴다', ({ variant, classes }) => {
    render(<Button variant={variant}>버튼</Button>);

    expect(screen.getByRole('button')).toHaveClass(...classes);
  });

  it('variant가 없으면 primary다', () => {
    render(<Button>버튼</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-strong', 'text-on-strong');
  });

  it('className으로 크기와 폭을 덮어쓴다', () => {
    render(<Button className="h-11 w-full px-6 text-body-16">버튼</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('h-11', 'w-full', 'px-6', 'text-body-16', 'text-on-strong');
    expect(button).not.toHaveClass('h-9', 'px-3.5', 'text-label-14');
  });

  it('className으로 바꾼 색은 기본 색을 지운다', () => {
    render(<Button className="bg-surface">버튼</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('bg-surface');
    expect(button).not.toHaveClass('bg-strong');
  });

  it('아이콘과 글자를 함께 그린다', () => {
    render(
      <Button>
        <svg aria-hidden="true" data-testid="icon" />
        추가
      </Button>,
    );

    expect(screen.getByRole('button', { name: '추가' })).toContainElement(
      screen.getByTestId('icon'),
    );
  });
});

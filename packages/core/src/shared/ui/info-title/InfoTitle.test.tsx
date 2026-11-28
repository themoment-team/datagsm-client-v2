import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { InfoTitle } from './InfoTitle';

// Figma WF/Info title의 Hover 밑줄
const HOVER_CLASSES = ['hover:underline', 'decoration-from-font'];

describe('InfoTitle', () => {
  it('children을 이름으로 그리고 기본 type은 button이라 form을 제출하지 않는다', () => {
    const handleSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <InfoTitle>OAuth 클라이언트</InfoTitle>
      </form>,
    );
    const button = screen.getByRole('button', { name: 'OAuth 클라이언트' });

    fireEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('누르면 onClick을 부른다', () => {
    const handleClick = vi.fn();
    render(<InfoTitle onClick={handleClick}>OAuth 클라이언트</InfoTitle>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('제목 요소로 감싸면 heading 이름이 된다', () => {
    render(
      <h1>
        <InfoTitle>OAuth 클라이언트</InfoTitle>
      </h1>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'OAuth 클라이언트' })).toBeInTheDocument();
  });

  it.each([
    [undefined, ['text-title-32', 'text-foreground']],
    ['title', ['text-title-32', 'text-foreground']],
    ['label', ['text-label-14', 'text-foreground']],
    ['labelMuted', ['text-label-14', 'text-foreground-muted']],
  ] as const)('variant=%s는 Figma 글자 모양 클래스를 쓴다', (variant, classes) => {
    render(<InfoTitle variant={variant}>항목 이름</InfoTitle>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass(...classes, ...HOVER_CLASSES);
    expect(button).not.toHaveClass('underline');
  });

  it('className을 덧붙이고 겹치는 클래스는 덮어쓴다', () => {
    render(
      <InfoTitle variant="label" className="mt-4 text-foreground-muted">
        최고 사용률
      </InfoTitle>,
    );
    const button = screen.getByRole('button');

    expect(button).toHaveClass('mt-4', 'text-label-14', 'text-foreground-muted');
    expect(button).not.toHaveClass('text-foreground');
  });
});

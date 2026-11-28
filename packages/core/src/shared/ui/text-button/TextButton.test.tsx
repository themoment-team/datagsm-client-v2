import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TextButton, TextLink } from './TextButton';

// Figma WF/Link의 글자·밑줄·호버 칠
const BASE_CLASSES = [
  'text-label-14',
  'text-foreground',
  'underline',
  'decoration-from-font',
  'not-disabled:hover:before:bg-hover',
];

describe('TextButton', () => {
  it('children을 이름으로 그리고 기본 type은 button이라 form을 제출하지 않는다', () => {
    const handleSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <TextButton>코드 다시 받기</TextButton>
      </form>,
    );
    const button = screen.getByRole('button', { name: '코드 다시 받기' });

    fireEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('누르면 onClick을 부른다', () => {
    const handleClick = vi.fn();
    render(<TextButton onClick={handleClick}>코드 다시 받기</TextButton>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disabled면 누를 수 없고 글자를 흐리게 한다', () => {
    const handleClick = vi.fn();
    render(
      <TextButton disabled onClick={handleClick}>
        코드 다시 받기
      </TextButton>,
    );
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:text-foreground-muted');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Figma 모양 클래스를 쓰고 className을 덧붙인다', () => {
    render(<TextButton className="mt-4 text-foreground-muted">코드 다시 받기</TextButton>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass(...BASE_CLASSES.filter((name) => name !== 'text-foreground'));
    expect(button).toHaveClass('mt-4', 'text-foreground-muted');
    expect(button).not.toHaveClass('text-foreground');
  });
});

describe('TextLink', () => {
  it('href로 가는 링크를 TextButton과 같은 모양으로 그린다', () => {
    render(
      <TextLink href="/signup" className="mt-4">
        회원가입
      </TextLink>,
    );
    const link = screen.getByRole('link', { name: '회원가입' });

    expect(link).toHaveAttribute('href', '/signup');
    expect(link).toHaveClass(...BASE_CLASSES, 'mt-4');
  });
});

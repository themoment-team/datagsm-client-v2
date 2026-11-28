import { fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from './Chip';

describe('Chip', () => {
  it('글자를 그린다', () => {
    render(<Chip>Kotlin</Chip>);

    expect(screen.getByText('Kotlin')).toBeInTheDocument();
  });

  it('onRemove가 없으면 지우기 버튼이 없다(읽기 전용)', () => {
    render(<Chip>Kotlin</Chip>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('onRemove가 있으면 "<글자> 삭제" 버튼을 그리고 누르면 부른다', () => {
    const handleRemove = vi.fn();
    render(<Chip onRemove={handleRemove}>Kotlin</Chip>);
    const button = screen.getByRole('button', { name: 'Kotlin 삭제' });

    fireEvent.click(button);

    expect(handleRemove).toHaveBeenCalledOnce();
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('form 안에서 지우기 버튼을 눌러도 제출하지 않는다', () => {
    const handleSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Chip onRemove={() => {}}>Kotlin</Chip>
      </form>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('removeLabel로 접근 이름을 바꾼다', () => {
    render(
      <Chip onRemove={() => {}} removeLabel="https://example.com/callback 주소 삭제">
        <code>https://example.com/callback</code>
      </Chip>,
    );

    expect(
      screen.getByRole('button', { name: 'https://example.com/callback 주소 삭제' }),
    ).toBeInTheDocument();
  });

  it('글자가 요소이고 removeLabel이 없으면 이름은 "삭제"다', () => {
    render(
      <Chip onRemove={() => {}}>
        <code>read</code>
      </Chip>,
    );

    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('Figma 모양 클래스를 쓰고 className을 병합한다', () => {
    render(<Chip className="mt-2 border-error">Kotlin</Chip>);
    const chip = screen.getByText('Kotlin');

    expect(chip).toHaveClass(
      'h-8',
      'gap-1',
      'rounded',
      'border',
      'px-3',
      'text-label-14',
      'text-foreground',
      'mt-2',
      'border-error',
    );
    expect(chip).not.toHaveClass('border-line');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FieldValue } from './FieldValue';

describe('FieldValue', () => {
  it('항목을 dt, 값을 dd로 그려 dl 안에서 이름·값 쌍이 된다', () => {
    render(
      <dl>
        <FieldValue label="이름">김유찬</FieldValue>
      </dl>,
    );

    const term = screen.getByRole('term');
    const definition = screen.getByRole('definition');

    expect(term).toHaveTextContent('이름');
    expect(term).toHaveClass('text-label-14', 'text-foreground-muted');
    expect(definition).toHaveTextContent('김유찬');
  });

  it.each([
    [undefined, ['text-body-16-regular', 'text-foreground'], ['font-mono', 'text-code-12']],
    ['text', ['text-body-16-regular', 'text-foreground'], ['font-mono', 'text-code-12']],
    ['code', ['font-mono', 'text-code-12', 'text-foreground'], ['text-body-16-regular']],
  ] as const)('variant=%s는 값에 Figma 글자 모양 클래스를 쓴다', (variant, classes, absent) => {
    render(
      <dl>
        <FieldValue label="클라이언트 ID" variant={variant}>
          9f3a1c2e-acav-weqr-adfe-a1b2c3d4e5f6
        </FieldValue>
      </dl>,
    );
    const definition = screen.getByRole('definition');

    expect(definition).toHaveClass(...classes);
    expect(definition).not.toHaveClass(...absent);
  });

  it('긴 값은 말줄임하지 않고 줄을 바꾼다', () => {
    const { container } = render(
      <dl>
        <FieldValue label="키">{'a'.repeat(200)}</FieldValue>
      </dl>,
    );

    expect(container.querySelector('dl > div')).toHaveClass('wrap-break-word', 'min-w-0');
    expect(screen.getByRole('definition')).not.toHaveClass('truncate');
  });

  it('className을 바깥 묶음에 덧붙이고 겹치는 클래스는 덮어쓴다', () => {
    const { container } = render(
      <dl>
        <FieldValue label="이름" className="col-span-2 gap-1">
          김유찬
        </FieldValue>
      </dl>,
    );
    const group = container.querySelector('dl > div');

    expect(group).toHaveClass('flex', 'flex-col', 'col-span-2', 'gap-1');
    expect(group).not.toHaveClass('gap-2');
  });
});

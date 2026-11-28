import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './FormField';

describe('FormField', () => {
  it('children 함수가 받은 id·aria-describedby를 펼친 입력에 라벨과 안내 문구가 연결된다', () => {
    render(
      <FormField label="이름" hint="실명을 적으세요">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: '이름' });

    expect(input).toHaveAccessibleDescription('실명을 적으세요');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('error면 aria-invalid를 넘기고 오류 문구를 alert로 보여 준다', () => {
    render(
      <FormField id="name" label="이름" hint="안내" error="이름을 적어 주세요">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: '이름' });

    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('이름을 적어 주세요');
    expect(screen.getByRole('alert')).toHaveClass('text-error');
  });

  it('hint가 error로 바뀌면 오류 문구를 같은 노드가 아닌 새 alert 노드로 그린다', () => {
    const { rerender } = render(
      <FormField label="이름" hint="실명을 적으세요">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const hint = screen.getByText('실명을 적으세요');

    rerender(
      <FormField label="이름" hint="실명을 적으세요" error="이름을 적어 주세요">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const alert = screen.getByRole('alert');

    expect(alert).not.toBe(hint);
    expect(hint).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '이름' })).toHaveAccessibleDescription(
      '이름을 적어 주세요',
    );
  });

  it('label 없이 info만 있어도 라벨 행을 그리고, 둘 다 없으면 그리지 않는다', () => {
    const { container, rerender } = render(
      <FormField info={<a href="/help">정보</a>}>{(control) => <input {...control} />}</FormField>,
    );

    expect(screen.getByRole('link', { name: '정보' }).parentElement).toHaveClass('px-2', 'py-0.5');
    expect(container.querySelector('label')).toBeNull();

    rerender(<FormField>{(control) => <input aria-label="이름" {...control} />}</FormField>);

    expect(container.firstChild?.childNodes).toHaveLength(1);
  });
});

import { type ChangeEvent, useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CheckboxOption } from './CheckboxOption';

describe('CheckboxOption', () => {
  it('label 글자를 이름으로 가진 체크박스를 그리고 누르면 체크가 바뀐다', () => {
    render(<CheckboxOption label="동아리 정보 읽기" />);
    const checkbox = screen.getByRole('checkbox', { name: '동아리 정보 읽기' });

    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('접근 이름은 label만이고 scope·description 보조 줄은 설명으로 연결한다', () => {
    render(<CheckboxOption label="급식 읽기" scope="neis:read" description="급식 메뉴" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAccessibleName('급식 읽기');
    expect(checkbox).toHaveAccessibleDescription('neis:read 급식 메뉴');
  });

  it('보조 줄이 없으면 aria-describedby를 붙이지 않는다', () => {
    render(<CheckboxOption label="개인정보 처리방침에 동의합니다" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAccessibleName('개인정보 처리방침에 동의합니다');
    expect(checkbox).not.toHaveAttribute('aria-describedby');
  });

  it('쓰는 곳에서 넘긴 aria-describedby를 지우지 않고 앞에 둔다', () => {
    render(
      <>
        <p id="extra">추가 설명</p>
        <CheckboxOption label="급식 읽기" description="급식 메뉴" aria-describedby="extra" />
      </>,
    );

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('추가 설명 급식 메뉴');
  });

  it('체크 칸 밖의 글자를 눌러도 체크가 바뀐다', () => {
    render(<CheckboxOption label="동아리 정보 읽기" scope="club:read" description="동아리 이름" />);

    fireEvent.click(screen.getByText('동아리 정보 읽기'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    fireEvent.click(screen.getByText('동아리 이름'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('disabled면 눌러도 바뀌지 않는다', () => {
    const handleChange = vi.fn();
    render(<CheckboxOption label="동의" disabled onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(screen.getByText('동의'));

    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('React Hook Form register처럼 넘긴 name·onChange·onBlur·ref가 input에 닿는다', () => {
    const ref = vi.fn();
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => event.target.checked);
    const onBlur = vi.fn();
    render(
      <form aria-label="권한">
        <CheckboxOption
          name="scopes"
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          value="neis:read"
          label="급식 읽기"
        />
        <CheckboxOption name="scopes" value="club:read" label="동아리 읽기" defaultChecked />
      </form>,
    );
    const checkbox = screen.getByRole('checkbox', { name: '급식 읽기' });

    fireEvent.click(checkbox);
    fireEvent.blur(checkbox);

    expect(ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute('name', 'scopes');
    expect(onChange).toHaveReturnedWith(true);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(
      new FormData(screen.getByRole('form', { name: '권한' }) as HTMLFormElement).getAll('scopes'),
    ).toEqual(['neis:read', 'club:read']);
  });

  it('checked와 onChange로 제어할 수 있다', () => {
    const Controlled = () => {
      const [checked, setChecked] = useState(true);
      return (
        <CheckboxOption
          label="알림 받기"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    };
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('Figma State: 체크 칸은 Unchecked면 subtle, Checked면 strong에 on-strong 체크 아이콘이다', () => {
    const { container } = render(<CheckboxOption label="항목 이름" />);

    expect(screen.getByRole('checkbox')).toHaveClass(
      'peer',
      'size-5',
      'rounded',
      'appearance-none',
      'bg-subtle',
      'checked:bg-strong',
    );
    expect(container.querySelector('svg')).toHaveClass(
      'size-4',
      'hidden',
      'peer-checked:block',
      'text-on-strong',
    );
  });

  it('scope와 description이 없으면 보조 줄을 그리지 않는다', () => {
    const { container } = render(<CheckboxOption label="개인정보 처리방침에 동의합니다" />);

    expect(container.querySelector('.text-foreground-muted')).toBeNull();
  });

  it('scope와 description이 모두 있으면 점으로 나눠 보조 줄에 그린다', () => {
    render(<CheckboxOption label="급식 읽기" scope="neis:read" description="급식 메뉴" />);

    expect(screen.getByText('neis:read')).toHaveClass('font-mono', 'text-code-12');
    expect(screen.getByText('·')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('급식 메뉴')).toHaveClass('text-caption-12');
    expect(screen.getByText('neis:read').parentElement).toHaveClass('text-foreground-muted');
  });

  it('scope 없이 description만 있으면 점 없이 설명만 그린다', () => {
    render(<CheckboxOption label="급식 읽기" description="급식 메뉴" />);

    expect(screen.getByText('급식 메뉴')).toBeInTheDocument();
    expect(screen.queryByText('·')).toBeNull();
  });

  it('padding 기본값은 16(px-4)이고 none이면 좌우 여백이 없다', () => {
    const { container, rerender } = render(<CheckboxOption label="항목" />);
    const row = container.querySelector('label');

    expect(row).toHaveClass('flex', 'items-center', 'gap-4', 'px-4');
    rerender(<CheckboxOption label="항목" padding="none" />);
    expect(row).not.toHaveClass('px-4');
    rerender(<CheckboxOption label="항목" padding={16} />);
    expect(row).toHaveClass('px-4');
  });

  it('className은 바깥 행에 붙는다', () => {
    const { container } = render(<CheckboxOption label="항목" className="py-2" />);

    expect(container.querySelector('label')).toHaveClass('py-2', 'px-4');
    expect(screen.getByRole('checkbox')).not.toHaveClass('py-2');
  });
});

import { type ChangeEvent, useState } from 'react';

import { TextButton } from '@datagsm/core/shared/ui/text-button';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SelectField } from './SelectField';

const GRADES = (
  <>
    <option value="1">1학년</option>
    <option value="2">2학년</option>
    <option value="3">3학년</option>
  </>
);

describe('SelectField', () => {
  it('label을 select 이름으로 연결하고 children option을 그린다', () => {
    render(<SelectField label="학년">{GRADES}</SelectField>);
    const select = screen.getByLabelText('학년');

    expect(select).toBe(screen.getByRole('combobox', { name: '학년' }));
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(select).toHaveValue('1');
  });

  it('placeholder는 value가 ""인 비활성 첫 option으로 그리고 처음에 골라져 있다', () => {
    render(
      <SelectField label="학년" placeholder="선택하세요">
        {GRADES}
      </SelectField>,
    );
    const placeholder = screen.getByRole('option', { name: '선택하세요' });

    expect(placeholder).toHaveValue('');
    expect(placeholder).toBeDisabled();
    expect(screen.getByLabelText('학년')).toHaveValue('');
    expect(screen.getByLabelText('학년')).toHaveClass(
      "has-[option[value='']:checked]:text-foreground-muted",
    );
  });

  it('defaultValue가 있으면 placeholder 대신 그 값을 고른다', () => {
    render(
      <SelectField label="학년" placeholder="선택하세요" defaultValue="2">
        {GRADES}
      </SelectField>,
    );

    expect(screen.getByLabelText('학년')).toHaveValue('2');
  });

  it('option을 고르면 change가 일어나고 값이 바뀐다', () => {
    const onChange = vi.fn((event: ChangeEvent<HTMLSelectElement>) => event.target.value);
    render(
      <SelectField label="학년" placeholder="선택하세요" onChange={onChange}>
        {GRADES}
      </SelectField>,
    );
    const select = screen.getByLabelText('학년');

    fireEvent.change(select, { target: { value: '3' } });

    expect(onChange).toHaveReturnedWith('3');
    expect(select).toHaveValue('3');
  });

  it('value와 onChange로 제어할 수 있다', () => {
    const Controlled = () => {
      const [value, setValue] = useState('');
      return (
        <SelectField
          label="학년"
          placeholder="선택하세요"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          {GRADES}
        </SelectField>
      );
    };
    render(<Controlled />);
    const select = screen.getByLabelText('학년');

    expect(select).toHaveValue('');
    fireEvent.change(select, { target: { value: '2' } });
    expect(select).toHaveValue('2');
  });

  it('hint를 aria-describedby로 연결하고 오류 상태가 아니다', () => {
    render(
      <SelectField label="학년" hint="현재 학년을 고르세요">
        {GRADES}
      </SelectField>,
    );
    const select = screen.getByLabelText('학년');

    expect(select).toHaveAccessibleDescription('현재 학년을 고르세요');
    expect(select).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('error가 있으면 hint 대신 오류 문구를 alert로 보여 주고 aria-invalid와 error 선을 붙인다', () => {
    const { container } = render(
      <SelectField label="학년" hint="안내" error="학년을 골라 주세요" aria-describedby="extra">
        {GRADES}
      </SelectField>,
    );
    const select = screen.getByLabelText('학년');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute(
      'aria-describedby',
      expect.stringMatching(/^extra \S+-message$/),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('학년을 골라 주세요');
    expect(screen.queryByText('안내')).toBeNull();
    expect(container.querySelector('.h-12')).toHaveClass('border-error', 'inset-ring-error');
  });

  it('React Hook Form register처럼 넘긴 name·onChange·onBlur·ref가 select에 닿는다', () => {
    const ref = vi.fn();
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <form aria-label="정보">
        <SelectField
          name="grade"
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          label="학년"
          placeholder="선택하세요"
        >
          {GRADES}
        </SelectField>
      </form>,
    );
    const select = screen.getByLabelText('학년');

    fireEvent.change(select, { target: { value: '2' } });
    fireEvent.blur(select);

    expect(ref).toHaveBeenCalledWith(select);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(
      new FormData(screen.getByRole('form', { name: '정보' }) as HTMLFormElement).get('grade'),
    ).toBe('2');
  });

  it('disabled면 select를 잠그고 라벨과 값을 foreground-muted, 선택칸 면을 subtle로 그린다', () => {
    const { container } = render(
      <SelectField label="학년" placeholder="선택하세요" defaultValue="1" disabled>
        {GRADES}
      </SelectField>,
    );
    const select = screen.getByLabelText('학년');

    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:text-foreground-muted');
    expect(container.querySelector('label')).toHaveClass('text-foreground-muted');
    expect(container.querySelector('.h-12')).toHaveClass('has-[select:disabled]:bg-subtle');
  });

  it('Figma Default·Filled·Focus: 1px line 선, 오른쪽 chevron, 포커스는 strong 2px', () => {
    const { container } = render(<SelectField label="학년">{GRADES}</SelectField>);
    const box = container.querySelector('.h-12');

    expect(box).toHaveClass(
      'rounded',
      'border',
      'border-line',
      'text-foreground-muted',
      'focus-within:border-strong',
      'focus-within:inset-ring-1',
      'focus-within:inset-ring-strong',
    );
    expect(screen.getByLabelText('학년')).toHaveClass(
      'appearance-none',
      'pl-4',
      'pr-10',
      'text-body-16-regular',
      'text-foreground',
    );
    expect(box?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('info를 라벨 옆에 그리고 라벨 이름에는 섞지 않는다', () => {
    render(
      <SelectField label="학년" info={<TextButton>정보</TextButton>}>
        {GRADES}
      </SelectField>,
    );

    expect(screen.getByRole('button', { name: '정보' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '학년' })).toBeInTheDocument();
  });

  it('className은 바깥 래퍼에 붙는다', () => {
    const { container } = render(
      <SelectField label="학년" className="w-64">
        {GRADES}
      </SelectField>,
    );

    expect(container.firstChild).toHaveClass('w-64', 'flex', 'flex-col', 'gap-2');
    expect(screen.getByLabelText('학년')).not.toHaveClass('w-64');
  });
});

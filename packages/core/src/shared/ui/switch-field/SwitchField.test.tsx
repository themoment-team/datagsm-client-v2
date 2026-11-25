import { type ChangeEvent, useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwitchField } from './SwitchField';

describe('SwitchField', () => {
  it('label만 이름으로, description은 설명으로 가진 switch를 그린다', () => {
    render(<SwitchField label="동기화 사용" description="새 변경을 동기화 PR로 받습니다." />);
    const toggle = screen.getByRole('switch', { name: '동기화 사용' });

    expect(toggle).toHaveAccessibleDescription('새 변경을 동기화 PR로 받습니다.');
  });

  it('스위치와 글(이름·설명)을 눌러도 켜짐이 바뀐다', () => {
    render(<SwitchField label="동기화 사용" description="설명" />);
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    fireEvent.click(screen.getByText('동기화 사용'));
    expect(toggle).not.toBeChecked();
    fireEvent.click(screen.getByText('설명'));
    expect(toggle).toBeChecked();
  });

  it('defaultChecked로 켜진 채 시작하고, checked와 onChange로 제어할 수 있다', () => {
    const Controlled = () => {
      const [checked, setChecked] = useState(false);
      return (
        <SwitchField
          label="제어"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    };
    render(
      <>
        <SwitchField label="기본" defaultChecked />
        <Controlled />
      </>,
    );

    expect(screen.getByRole('switch', { name: '기본' })).toBeChecked();
    const controlled = screen.getByRole('switch', { name: '제어' });
    fireEvent.click(screen.getByText('제어'));
    expect(controlled).toBeChecked();
  });

  it('disabled면 글을 눌러도 바뀌지 않는다', () => {
    const handleChange = vi.fn();
    render(<SwitchField label="동기화 사용" disabled onChange={handleChange} />);

    fireEvent.click(screen.getByText('동기화 사용'));

    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('React Hook Form register처럼 넘긴 name·onChange·onBlur·ref가 input에 닿는다', () => {
    const ref = vi.fn();
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => event.target.checked);
    const onBlur = vi.fn();
    render(
      <SwitchField name="sync" onChange={onChange} onBlur={onBlur} ref={ref} label="동기화" />,
    );
    const toggle = screen.getByRole('switch');

    fireEvent.click(screen.getByText('동기화'));
    fireEvent.blur(toggle);

    expect(ref).toHaveBeenCalledWith(toggle);
    expect(toggle).toHaveAttribute('name', 'sync');
    expect(onChange).toHaveReturnedWith(true);
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('넘긴 aria-describedby는 설명 id보다 앞에 이어 붙인다', () => {
    render(
      <>
        <p id="extra">추가 안내</p>
        <SwitchField label="동기화" description="설명" aria-describedby="extra" />
      </>,
    );

    expect(screen.getByRole('switch')).toHaveAccessibleDescription('추가 안내 설명');
  });

  it('description이 없으면 설명 줄과 aria-describedby를 두지 않는다', () => {
    render(<SwitchField label="동기화" />);

    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-describedby');
    expect(screen.getByText('동기화').nextSibling).toBeNull();
  });

  it('Figma 글: 이름은 body-16 foreground, 설명은 label-14 foreground-muted, 사이 4', () => {
    render(<SwitchField label="설정 이름" description="설명" />);

    expect(screen.getByText('설정 이름')).toHaveClass('text-body-16', 'text-foreground');
    expect(screen.getByText('설명')).toHaveClass('text-label-14', 'text-foreground-muted');
    expect(screen.getByText('설명').parentElement).toHaveClass('flex-1', 'flex-col', 'gap-1');
  });

  it('className은 바깥 label(줄)에 붙는다', () => {
    const { container } = render(<SwitchField label="동기화" className="py-2" />);

    expect(container.querySelector('label')).toHaveClass('py-2', 'flex', 'items-center', 'gap-4');
    expect(screen.getByRole('switch')).not.toHaveClass('py-2');
  });
});

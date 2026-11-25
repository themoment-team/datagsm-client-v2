import { type ChangeEvent, useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('aria-label을 이름으로 가진 switch를 그리고 누르면 켜짐이 바뀐다', () => {
    render(<Switch aria-label="동기화 사용" />);
    const toggle = screen.getByRole('switch', { name: '동기화 사용' });

    expect(toggle).toHaveAttribute('type', 'checkbox');
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('감싼 label 글자를 눌러도 바뀐다', () => {
    render(
      <label>
        알림 받기
        <Switch />
      </label>,
    );

    fireEvent.click(screen.getByText('알림 받기'));
    expect(screen.getByRole('switch', { name: '알림 받기' })).toBeChecked();
  });

  it('defaultChecked로 켜진 채 시작한다', () => {
    render(<Switch aria-label="동기화" defaultChecked />);

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('checked와 onChange로 제어할 수 있다', () => {
    const Controlled = () => {
      const [checked, setChecked] = useState(true);
      return (
        <Switch
          aria-label="동기화"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    };
    render(<Controlled />);
    const toggle = screen.getByRole('switch');

    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('disabled면 눌러도 바뀌지 않는다', () => {
    const handleChange = vi.fn();
    render(
      <label>
        동기화
        <Switch disabled onChange={handleChange} />
      </label>,
    );
    const toggle = screen.getByRole('switch');

    // jsdom은 disabled input에 직접 보낸 click도 체크를 바꾸므로 label을 누른다. 실제 브라우저 확인은 렌더 비교에서 했다.
    fireEvent.click(screen.getByText('동기화'));

    expect(toggle).toBeDisabled();
    expect(toggle).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('React Hook Form register처럼 넘긴 name·onChange·onBlur·ref가 input에 닿는다', () => {
    const ref = vi.fn();
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => event.target.checked);
    const onBlur = vi.fn();
    render(
      <form aria-label="설정">
        <Switch aria-label="동기화" name="sync" onChange={onChange} onBlur={onBlur} ref={ref} />
      </form>,
    );
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);
    fireEvent.blur(toggle);

    expect(ref).toHaveBeenCalledWith(toggle);
    expect(toggle).toHaveAttribute('name', 'sync');
    expect(onChange).toHaveReturnedWith(true);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(
      new FormData(screen.getByRole('form', { name: '설정' }) as HTMLFormElement).get('sync'),
    ).toBe('on');
  });

  it('Figma Value·State: 트랙은 :checked·:disabled로, 손잡이는 peer로 그린다', () => {
    const { container } = render(<Switch aria-label="동기화" />);

    expect(screen.getByRole('switch')).toHaveClass(
      'peer',
      'h-6',
      'w-11',
      'appearance-none',
      'rounded',
      'border-line',
      'bg-subtle',
      'checked:bg-strong',
      'disabled:checked:bg-subtle',
    );
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'size-5',
      'bg-foreground-muted',
      'peer-checked:translate-x-5',
      'peer-checked:bg-on-strong',
      'peer-disabled:bg-line',
    );
  });

  it('className은 바깥 span에 붙는다', () => {
    const { container } = render(<Switch aria-label="동기화" className="ml-2" />);

    expect(container.firstChild).toHaveClass('ml-2', 'relative', 'inline-flex');
    expect(screen.getByRole('switch')).not.toHaveClass('ml-2');
  });
});

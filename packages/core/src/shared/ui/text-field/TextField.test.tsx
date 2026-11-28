import { type ChangeEvent, useState } from 'react';

import { Button } from '@datagsm/core/shared/ui/button';
import { TextButton } from '@datagsm/core/shared/ui/text-button';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('label을 input 이름으로 연결한다', () => {
    render(<TextField label="이메일" placeholder="이메일 아이디를 입력하세요" />);
    const input = screen.getByLabelText('이메일');

    expect(input).toBe(screen.getByRole('textbox', { name: '이메일' }));
    expect(input).toHaveAttribute('placeholder', '이메일 아이디를 입력하세요');
  });

  it('label이 없으면 라벨 줄을 그리지 않는다', () => {
    const { container } = render(<TextField aria-label="비밀번호" type="password" />);

    expect(container.querySelector('label')).toBeNull();
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
  });

  it('넘긴 id를 쓰고 label도 그 id에 연결한다', () => {
    render(<TextField id="email" label="이메일" />);

    expect(screen.getByLabelText('이메일')).toHaveAttribute('id', 'email');
  });

  it('hint를 aria-describedby로 연결하고 오류 상태가 아니다', () => {
    render(<TextField label="이메일" hint="@gsm.hs.kr 계정만 쓸 수 있습니다" />);
    const input = screen.getByLabelText('이메일');

    expect(input).toHaveAccessibleDescription('@gsm.hs.kr 계정만 쓸 수 있습니다');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('@gsm.hs.kr 계정만 쓸 수 있습니다')).toHaveClass(
      'text-label-14',
      'text-foreground-muted',
    );
  });

  it('error가 있으면 hint 대신 오류 문구를 alert로 보여 주고 aria-invalid를 붙인다', () => {
    const { container } = render(
      <TextField label="인증 코드" hint="메일로 받은 코드" error="인증 코드가 맞지 않습니다" />,
    );
    const input = screen.getByLabelText('인증 코드');
    const alert = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('인증 코드가 맞지 않습니다');
    expect(alert).toHaveTextContent('인증 코드가 맞지 않습니다');
    expect(alert).toHaveClass('text-label-14', 'text-error');
    expect(alert.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('메일로 받은 코드')).toBeNull();
    // Figma Error: 선 error 2px(1px border + 1px inset ring)
    expect(container.querySelector('.h-12')).toHaveClass('border-error', 'inset-ring-error');
  });

  it('오류 상태에서도 포커스하면 error 선 바깥에 strong outline을 그린다', () => {
    const { container } = render(<TextField label="인증 코드" error="인증 코드가 맞지 않습니다" />);
    const box = container.querySelector('.h-12');

    expect(box).toHaveClass(
      'border-error',
      'focus-within:outline-2',
      'focus-within:outline-offset-2',
      'focus-within:outline-strong',
    );
    expect(box).not.toHaveClass('focus-within:border-strong');
  });

  it('쓰는 곳에서 넘긴 aria-describedby를 지우지 않고 앞에 둔다', () => {
    render(
      <>
        <p id="extra">추가 설명</p>
        <TextField label="이메일" hint="안내 문구" aria-describedby="extra" />
      </>,
    );

    expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription('추가 설명 안내 문구');
  });

  it('React Hook Form register처럼 넘긴 name·onChange·onBlur·ref가 input에 닿는다', () => {
    const ref = vi.fn();
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => event.target.value);
    const onBlur = vi.fn();
    render(
      <form aria-label="로그인">
        <TextField name="email" onChange={onChange} onBlur={onBlur} ref={ref} label="이메일" />
      </form>,
    );
    const input = screen.getByLabelText('이메일');

    fireEvent.change(input, { target: { value: 's25008' } });
    fireEvent.blur(input);

    expect(ref).toHaveBeenCalledWith(input);
    expect(input).toHaveAttribute('name', 'email');
    expect(onChange).toHaveReturnedWith('s25008');
    expect(onBlur).toHaveBeenCalledOnce();
    expect(
      new FormData(screen.getByRole('form', { name: '로그인' }) as HTMLFormElement).get('email'),
    ).toBe('s25008');
  });

  it('value와 onChange로 제어할 수 있다', () => {
    const Controlled = () => {
      const [value, setValue] = useState('a');
      return (
        <TextField label="이름" value={value} onChange={(event) => setValue(event.target.value)} />
      );
    };
    render(<Controlled />);
    const input = screen.getByLabelText('이름');

    fireEvent.change(input, { target: { value: 'ab' } });

    expect(input).toHaveValue('ab');
  });

  it('disabled면 input을 잠그고 라벨과 값을 foreground-muted, 입력칸 면을 subtle로 그린다', () => {
    const { container } = render(<TextField label="이메일" defaultValue="s25008" disabled />);
    const input = screen.getByLabelText('이메일');

    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:text-foreground-muted');
    expect(container.querySelector('label')).toHaveClass('text-foreground-muted');
    expect(container.querySelector('.h-12')).toHaveClass('has-disabled:bg-subtle');
  });

  it('Figma Default·Filled·Focus: 1px line 선, 값은 foreground·placeholder는 foreground-muted, 포커스는 strong 2px', () => {
    const { container } = render(<TextField label="항목 이름" />);
    const box = container.querySelector('.h-12');

    expect(box).toHaveClass(
      'h-12',
      'px-4',
      'gap-2',
      'rounded',
      'border',
      'border-line',
      'text-body-16-regular',
      'focus-within:border-strong',
      'focus-within:inset-ring-1',
      'focus-within:inset-ring-strong',
    );
    expect(screen.getByLabelText('항목 이름')).toHaveClass(
      'text-foreground',
      'placeholder:text-foreground-muted',
    );
    expect(container.querySelector('label')).toHaveClass('text-label-14', 'text-foreground');
  });

  it('suffix와 trailing을 입력칸 안 오른쪽에 그리고 suffix는 설명으로 읽힌다', () => {
    const { container } = render(
      <TextField label="이메일" suffix="@gsm.hs.kr" trailing="04:52" hint="안내" />,
    );
    const box = container.querySelector('.h-12');
    const input = screen.getByLabelText('이메일');

    expect(box?.children[0]).toBe(input);
    expect(box?.children[1]).toHaveTextContent('@gsm.hs.kr');
    expect(box?.children[2]).toHaveTextContent('04:52');
    expect(input).toHaveAccessibleDescription('@gsm.hs.kr 안내');
  });

  it('action은 입력칸 바깥 오른쪽에 그린다', () => {
    const { container } = render(
      <TextField
        label="이메일"
        suffix="@gsm.hs.kr"
        action={
          <Button variant="secondary" className="w-20">
            코드 전송
          </Button>
        }
      />,
    );
    const button = screen.getByRole('button', { name: '코드 전송' });

    expect(container.querySelector('.h-12')).not.toContainElement(button);
    expect(button.parentElement).toBe(container.querySelector('.h-12')?.parentElement);
    expect(button).toHaveClass('w-20');
  });

  it('info를 라벨 옆에 그리고 라벨 이름에는 섞지 않는다', () => {
    render(<TextField label="이메일" info={<TextButton>정보</TextButton>} disabled />);
    const info = screen.getByRole('button', { name: '정보' });

    expect(screen.getByRole('textbox', { name: '이메일' })).toBeInTheDocument();
    expect(info.parentElement).toHaveClass('px-2', 'py-0.5');
    // Figma Disabled: 라벨만 흐려지고 정보 링크는 그대로 누를 수 있다.
    expect(info).toBeEnabled();
  });

  it('className은 바깥 래퍼에 붙는다', () => {
    const { container } = render(<TextField label="이메일" className="w-64" />);

    expect(container.firstChild).toHaveClass('w-64', 'flex', 'flex-col', 'gap-2');
    expect(screen.getByLabelText('이메일')).not.toHaveClass('w-64');
  });
});

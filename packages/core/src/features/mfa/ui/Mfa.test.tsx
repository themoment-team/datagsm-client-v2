import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Mfa } from './Mfa';

type MfaProps = ComponentProps<typeof Mfa>;

// 콜백은 매번 새 mock이고, rerenderWith는 같은 콜백에 state 등만 바꿔 다시 그린다.
const renderMfa = (props: Partial<MfaProps> & Pick<MfaProps, 'state'>) => {
  const baseProps = {
    email: 's25008@gsm.hs.kr',
    codeRemainingSeconds: 292,
    sessionRemainingSeconds: 583,
    onSelectFingerprint: vi.fn(),
    onSelectEmail: vi.fn(),
    onRetryFingerprint: vi.fn(),
    onSubmitCode: vi.fn(),
    onResendCode: vi.fn(),
    ...props,
  };
  const result = render(<Mfa {...baseProps} />);
  const rerenderWith = (next: Partial<MfaProps>) =>
    result.rerender(<Mfa {...baseProps} {...next} />);

  return { ...result, ...baseProps, rerenderWith };
};

const codeInput = () => screen.getByRole('textbox', { name: '인증 코드' });

describe('Mfa 방법 고르기', () => {
  it('지문(Primary)과 이메일(Secondary) 버튼을 그리고 누르면 각 콜백을 부른다', () => {
    const { onSelectFingerprint, onSelectEmail } = renderMfa({ state: 'choose-method' });
    const fingerprint = screen.getByRole('button', { name: '지문으로 인증' });
    const email = screen.getByRole('button', { name: '이메일로 인증' });

    expect(screen.getByText('본인 인증 방법을 고르세요.')).toHaveClass('text-body-16-regular');
    expect(fingerprint).toHaveClass('bg-strong', 'w-full');
    expect(email).toHaveClass('bg-subtle', 'w-full');

    fireEvent.click(fingerprint);
    fireEvent.click(email);

    expect(onSelectFingerprint).toHaveBeenCalledOnce();
    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('지문 사용 불가면 지문 버튼을 막고 이유를 설명으로 연결하며 이메일 버튼을 Primary로 올린다', () => {
    const { onSelectFingerprint } = renderMfa({ state: 'fingerprint-unavailable' });
    const fingerprint = screen.getByRole('button', { name: '지문으로 인증' });

    expect(fingerprint).toBeDisabled();
    expect(fingerprint).toHaveClass('bg-subtle');
    expect(fingerprint).toHaveAccessibleDescription('이 기기에 등록한 지문이 없습니다');
    expect(screen.getByRole('button', { name: '이메일로 인증' })).toHaveClass('bg-strong');

    fireEvent.click(fingerprint);

    expect(onSelectFingerprint).not.toHaveBeenCalled();
  });
});

describe('Mfa 지문', () => {
  it('지문 대기는 안내를 status로 알리고 이메일 버튼만 둔다', () => {
    const { onSelectEmail } = renderMfa({ state: 'fingerprint-waiting' });

    expect(screen.getByRole('status')).toHaveTextContent('지문 센서에 손가락을 대세요');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: '이메일로 인증' }));

    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('지문 실패는 오류를 alert로 알리고 다시 시도를 부른다', () => {
    const { onRetryFingerprint, onSelectEmail } = renderMfa({ state: 'fingerprint-failed' });
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('지문을 확인하지 못했습니다');
    expect(alert.parentElement).toHaveClass('border-error', 'text-error');
    expect(screen.getByRole('button', { name: '이메일로 인증' })).toHaveClass(
      'bg-subtle',
      'flex-1',
    );

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    fireEvent.click(screen.getByRole('button', { name: '이메일로 인증' }));

    expect(onRetryFingerprint).toHaveBeenCalledOnce();
    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('대기에서 실패로 바뀌면 status를 alert로 바꾼다', () => {
    const { rerenderWith } = renderMfa({ state: 'fingerprint-waiting' });

    rerenderWith({ state: 'fingerprint-failed' });

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('지문을 확인하지 못했습니다');
  });
});

describe('Mfa 이메일 코드', () => {
  it('보낸 주소, 코드 남은 시간, 세션 남은 시간을 보여 주고 입력칸에 포커스한다', () => {
    renderMfa({ state: 'email-code' });
    const input = codeInput();

    expect(screen.getByText('s25008@gsm.hs.kr로 인증 코드를 보냈습니다.')).toBeInTheDocument();
    expect(screen.getByText('04:52')).toBeInTheDocument();
    expect(screen.getByText('세션 만료까지 09:43')).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('placeholder', '메일로 받은 코드를 입력하세요');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
  });

  it('코드가 비었으면 인증 버튼을 막고, 입력하면 앞뒤 공백을 지운 값으로 제출한다', () => {
    const { onSubmitCode } = renderMfa({ state: 'email-code' });
    const button = screen.getByRole('button', { name: '인증' });

    expect(button).toBeDisabled();

    fireEvent.change(codeInput(), { target: { value: '   ' } });
    expect(button).toBeDisabled();

    fireEvent.change(codeInput(), { target: { value: ' 25095814 ' } });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'submit');

    fireEvent.click(button);

    expect(onSubmitCode).toHaveBeenCalledExactlyOnceWith('25095814');
  });

  it('입력칸에서 Enter(form 제출)로도 제출한다', () => {
    const { onSubmitCode } = renderMfa({ state: 'email-code' });

    fireEvent.change(codeInput(), { target: { value: '25095814' } });
    fireEvent.submit(codeInput().closest('form') as HTMLFormElement);

    expect(onSubmitCode).toHaveBeenCalledExactlyOnceWith('25095814');
  });

  it('인증하는 중에는 입력칸과 버튼을 막고 버튼 글을 바꾸며 값은 남긴다', () => {
    const { rerenderWith, onSubmitCode } = renderMfa({ state: 'email-code' });
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    rerenderWith({ state: 'verifying', codeRemainingSeconds: 270 });

    expect(codeInput()).toBeDisabled();
    expect(codeInput()).toHaveValue('25095814');
    expect(screen.getByRole('button', { name: '인증하는 중' })).toBeDisabled();
    expect(screen.getByText('04:30')).toBeInTheDocument();

    fireEvent.submit(codeInput().closest('form') as HTMLFormElement);

    expect(onSubmitCode).not.toHaveBeenCalled();
  });

  it('코드 불일치는 오류를 alert로 보여 주고 값과 남은 시간을 남기며 다시 제출할 수 있다', () => {
    const { rerenderWith, onSubmitCode } = renderMfa({ state: 'email-code' });
    fireEvent.change(codeInput(), { target: { value: '25095841' } });

    rerenderWith({ state: 'code-mismatch', codeRemainingSeconds: 252 });

    expect(screen.getByRole('alert')).toHaveTextContent('인증 코드가 맞지 않습니다');
    expect(codeInput()).toHaveAttribute('aria-invalid', 'true');
    expect(codeInput()).toHaveValue('25095841');
    expect(screen.getByText('04:12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '인증' }));

    expect(onSubmitCode).toHaveBeenCalledExactlyOnceWith('25095841');
  });

  it('코드 만료는 오류를 alert로 보여 주고 남은 시간을 지우며 값이 있어도 인증 버튼을 막는다', () => {
    const { container, onSubmitCode } = renderMfa({
      state: 'code-expired',
      codeRemainingSeconds: 0,
    });
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '인증 시간이 지났습니다. 코드를 다시 받으세요',
    );
    expect(container).not.toHaveTextContent('00:00');
    expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();

    fireEvent.submit(codeInput().closest('form') as HTMLFormElement);

    expect(onSubmitCode).not.toHaveBeenCalled();
  });

  it('코드 다시 받기는 입력값을 비우고 onResendCode를, 지문으로 인증은 onSelectFingerprint를 부른다', () => {
    const { onResendCode, onSelectFingerprint, onSubmitCode } = renderMfa({
      state: 'code-mismatch',
    });
    fireEvent.change(codeInput(), { target: { value: '25095841' } });

    fireEvent.click(screen.getByRole('button', { name: '코드 다시 받기' }));
    fireEvent.click(screen.getByRole('button', { name: '지문으로 인증' }));

    expect(onResendCode).toHaveBeenCalledOnce();
    expect(onSelectFingerprint).toHaveBeenCalledOnce();
    expect(codeInput()).toHaveValue('');
    // 글자 버튼은 type="button"이라 form을 제출하지 않는다.
    expect(onSubmitCode).not.toHaveBeenCalled();
  });

  it('지문 단계로 나갔다 돌아오면 입력값이 비어 있다', () => {
    const { rerenderWith } = renderMfa({ state: 'email-code' });
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    rerenderWith({ state: 'fingerprint-waiting' });
    rerenderWith({ state: 'email-code' });

    expect(codeInput()).toHaveValue('');
  });

  it('className을 바깥 요소에 덧붙인다', () => {
    const { container } = renderMfa({ state: 'choose-method', className: 'mt-6' });

    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-4', 'mt-6');
  });
});

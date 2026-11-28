import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MfaEmailStep } from './MfaEmailStep';
import { MfaFingerprintStep } from './MfaFingerprintStep';

type MfaEmailStepProps = ComponentProps<typeof MfaEmailStep>;

// 콜백은 매번 새 mock이고, rerenderWith는 같은 콜백에 status 등만 바꿔 다시 그린다.
const renderStep = (props: Partial<MfaEmailStepProps> = {}) => {
  const baseProps = {
    email: 's25008@gsm.hs.kr',
    status: 'idle' as const,
    codeRemainingSeconds: 292,
    sessionRemainingSeconds: 583,
    onSubmitCode: vi.fn(),
    onResendCode: vi.fn(),
    onSelectFingerprint: vi.fn(),
    ...props,
  };
  const result = render(<MfaEmailStep {...baseProps} />);
  const rerenderWith = (next: Partial<MfaEmailStepProps>) =>
    result.rerender(<MfaEmailStep {...baseProps} {...next} />);

  return { ...result, ...baseProps, rerenderWith };
};

const codeInput = () => screen.getByRole('textbox', { name: '인증 코드' });
const submitForm = () => fireEvent.submit(codeInput().closest('form') as HTMLFormElement);

describe('MfaEmailStep', () => {
  it('보낸 주소, 코드 남은 시간, 세션 남은 시간을 보여 주고 입력칸에 포커스한다', () => {
    renderStep();
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
    const { onSubmitCode } = renderStep();
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
    const { onSubmitCode } = renderStep();

    fireEvent.change(codeInput(), { target: { value: '25095814' } });
    submitForm();

    expect(onSubmitCode).toHaveBeenCalledExactlyOnceWith('25095814');
  });

  it('인증하는 중에는 입력칸을 읽기 전용으로, 버튼과 코드 다시 받기를 막고 버튼 글을 바꾸며 값은 남긴다', () => {
    const { rerenderWith, onSubmitCode, onResendCode } = renderStep();
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    rerenderWith({ status: 'verifying', codeRemainingSeconds: 270 });

    expect(codeInput()).toHaveAttribute('readonly');
    expect(codeInput()).toHaveAttribute('aria-busy', 'true');
    expect(codeInput()).toHaveValue('25095814');
    expect(screen.getByRole('button', { name: '인증하는 중' })).toBeDisabled();
    expect(screen.getByText('04:30')).toBeInTheDocument();

    const resend = screen.getByRole('button', { name: '코드 다시 받기' });
    expect(resend).toBeDisabled();
    fireEvent.click(resend);
    submitForm();

    expect(onSubmitCode).not.toHaveBeenCalled();
    expect(onResendCode).not.toHaveBeenCalled();
    expect(codeInput()).toHaveValue('25095814');
  });

  it('인증하는 중에도 입력칸 포커스를 지키고, 불일치로 돌아오면 바로 고쳐 쓸 수 있다', () => {
    const { rerenderWith } = renderStep();
    fireEvent.change(codeInput(), { target: { value: '25095841' } });
    expect(codeInput()).toHaveFocus();

    rerenderWith({ status: 'verifying' });

    expect(codeInput()).not.toBeDisabled();
    expect(codeInput()).toHaveFocus();

    rerenderWith({ status: 'mismatch' });

    expect(codeInput()).toHaveFocus();
    expect(codeInput()).not.toHaveAttribute('readonly');
    expect(codeInput()).not.toHaveAttribute('aria-busy');
  });

  it('코드 불일치는 오류를 alert로 보여 주고 값과 남은 시간을 남기며 다시 제출할 수 있다', () => {
    const { rerenderWith, onSubmitCode } = renderStep();
    fireEvent.change(codeInput(), { target: { value: '25095841' } });

    rerenderWith({ status: 'mismatch', codeRemainingSeconds: 252 });

    expect(screen.getByRole('alert')).toHaveTextContent('인증 코드가 맞지 않습니다');
    expect(codeInput()).toHaveAttribute('aria-invalid', 'true');
    expect(codeInput()).toHaveValue('25095841');
    expect(screen.getByText('04:12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '인증' }));

    expect(onSubmitCode).toHaveBeenCalledExactlyOnceWith('25095841');
  });

  it('코드 만료는 오류를 alert로 보여 주고 남은 시간을 지우며 값이 있어도 인증 버튼을 막는다', () => {
    const { container, onSubmitCode } = renderStep({ status: 'expired', codeRemainingSeconds: 0 });
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '인증 시간이 지났습니다. 코드를 다시 받으세요',
    );
    expect(container).not.toHaveTextContent('00:00');
    expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();

    submitForm();

    expect(onSubmitCode).not.toHaveBeenCalled();
  });

  it('코드 다시 받기는 입력값을 비우고 onResendCode를, 지문으로 인증은 onSelectFingerprint를 부른다', () => {
    const { onResendCode, onSelectFingerprint, onSubmitCode } = renderStep({ status: 'mismatch' });
    fireEvent.change(codeInput(), { target: { value: '25095841' } });

    fireEvent.click(screen.getByRole('button', { name: '코드 다시 받기' }));
    fireEvent.click(screen.getByRole('button', { name: '지문으로 인증' }));

    expect(onResendCode).toHaveBeenCalledOnce();
    expect(onSelectFingerprint).toHaveBeenCalledOnce();
    expect(codeInput()).toHaveValue('');
    // 글자 버튼은 type="button"이라 form을 제출하지 않는다.
    expect(onSubmitCode).not.toHaveBeenCalled();
  });

  it('onSelectFingerprint가 없으면 지문으로 인증을 그리지 않는다', () => {
    renderStep({ onSelectFingerprint: undefined });

    expect(screen.queryByRole('button', { name: '지문으로 인증' })).toBeNull();
    expect(screen.getByRole('button', { name: '코드 다시 받기' })).toBeInTheDocument();
  });

  it('sessionRemainingSeconds가 없으면 세션 줄을 그리지 않는다', () => {
    const { container } = renderStep({ sessionRemainingSeconds: undefined });

    expect(container).not.toHaveTextContent('세션 만료까지');
    expect(screen.getByText('04:52')).toBeInTheDocument();
  });

  it('다른 단계로 바꿨다 돌아오면 입력값이 비어 있다', () => {
    const { rerender, rerenderWith } = renderStep();
    fireEvent.change(codeInput(), { target: { value: '25095814' } });

    rerender(<MfaFingerprintStep status="waiting" onRetry={vi.fn()} />);
    rerenderWith({});

    expect(codeInput()).toHaveValue('');
  });

  it('form은 contents라 블록 간격은 바깥 요소가 정하고 className을 거기에 덧붙인다', () => {
    const { container } = renderStep({ className: 'mt-6' });

    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-4', 'mt-6');
    expect(codeInput().closest('form')).toHaveClass('contents');
  });
});

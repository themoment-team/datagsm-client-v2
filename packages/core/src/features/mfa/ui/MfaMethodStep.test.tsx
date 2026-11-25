import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MfaMethodStep } from './MfaMethodStep';

const renderStep = (fingerprintAvailable: boolean, className?: string) => {
  const onSelectFingerprint = vi.fn();
  const onSelectEmail = vi.fn();
  const result = render(
    <MfaMethodStep
      fingerprintAvailable={fingerprintAvailable}
      onSelectFingerprint={onSelectFingerprint}
      onSelectEmail={onSelectEmail}
      className={className}
    />,
  );

  return { ...result, onSelectFingerprint, onSelectEmail };
};

describe('MfaMethodStep', () => {
  it('지문(Primary)과 이메일(Secondary) 버튼을 그리고 누르면 각 콜백을 부른다', () => {
    const { onSelectFingerprint, onSelectEmail } = renderStep(true);
    const fingerprint = screen.getByRole('button', { name: '지문으로 인증' });
    const email = screen.getByRole('button', { name: '이메일로 인증' });

    expect(screen.getByText('본인 인증 방법을 고르세요.')).toHaveClass('text-body-16-regular');
    expect(fingerprint).toHaveClass('bg-strong', 'w-full');
    expect(email).toHaveClass('bg-subtle', 'w-full');
    expect(fingerprint).not.toHaveAttribute('aria-describedby');

    fireEvent.click(fingerprint);
    fireEvent.click(email);

    expect(onSelectFingerprint).toHaveBeenCalledOnce();
    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('지문 사용 불가면 지문 버튼을 막고 이유를 설명으로 연결하며 이메일 버튼을 Primary로 올린다', () => {
    const { onSelectFingerprint } = renderStep(false);
    const fingerprint = screen.getByRole('button', { name: '지문으로 인증' });

    expect(fingerprint).toBeDisabled();
    expect(fingerprint).toHaveClass('bg-subtle');
    expect(fingerprint).toHaveAccessibleDescription('이 기기에 등록한 지문이 없습니다');
    expect(screen.getByRole('button', { name: '이메일로 인증' })).toHaveClass('bg-strong');

    fireEvent.click(fingerprint);

    expect(onSelectFingerprint).not.toHaveBeenCalled();
  });

  it('className을 바깥 요소에 덧붙인다', () => {
    const { container } = renderStep(true, 'mt-6');

    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-4', 'mt-6');
  });
});

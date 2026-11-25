import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MfaFingerprintStep } from './MfaFingerprintStep';

type MfaFingerprintStepProps = ComponentProps<typeof MfaFingerprintStep>;

const renderStep = (
  props: Partial<MfaFingerprintStepProps> & Pick<MfaFingerprintStepProps, 'status'>,
) => {
  const baseProps = { onRetry: vi.fn(), onSelectEmail: vi.fn(), ...props };
  const result = render(<MfaFingerprintStep {...baseProps} />);
  const rerenderWith = (next: Partial<MfaFingerprintStepProps>) =>
    result.rerender(<MfaFingerprintStep {...baseProps} {...next} />);

  return { ...result, ...baseProps, rerenderWith };
};

describe('MfaFingerprintStep', () => {
  it('지문 대기는 안내를 status로 알리고 이메일 버튼만 둔다', () => {
    const { onSelectEmail } = renderStep({ status: 'waiting' });

    expect(screen.getByRole('status')).toHaveTextContent('지문 센서에 손가락을 대세요');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: '이메일로 인증' }));

    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('지문 실패는 오류를 alert로 알리고 다시 시도를 부른다', () => {
    const { onRetry, onSelectEmail } = renderStep({ status: 'failed' });
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('지문을 확인하지 못했습니다');
    expect(alert.parentElement).toHaveClass('border-error', 'text-error');
    expect(screen.getByRole('button', { name: '이메일로 인증' })).toHaveClass(
      'bg-subtle',
      'flex-1',
    );

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    fireEvent.click(screen.getByRole('button', { name: '이메일로 인증' }));

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onSelectEmail).toHaveBeenCalledOnce();
  });

  it('대기에서 실패로 바뀌면 status를 alert로 바꾼다', () => {
    const { rerenderWith } = renderStep({ status: 'waiting' });

    rerenderWith({ status: 'failed' });

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('지문을 확인하지 못했습니다');
  });

  it('onSelectEmail이 없으면 대기는 버튼 줄을 그리지 않는다', () => {
    const { container } = renderStep({ status: 'waiting', onSelectEmail: undefined });

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.firstChild?.childNodes).toHaveLength(1);
  });

  it('onSelectEmail이 없으면 실패는 다시 시도 하나가 폭을 채운다', () => {
    const { onRetry } = renderStep({ status: 'failed', onSelectEmail: undefined });
    const retry = screen.getByRole('button', { name: '다시 시도' });

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(retry).toHaveClass('flex-1', 'bg-strong');

    fireEvent.click(retry);

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('className을 바깥 요소에 덧붙인다', () => {
    const { container } = renderStep({ status: 'waiting', className: 'mt-6' });

    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-4', 'mt-6');
  });
});

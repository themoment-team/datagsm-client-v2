import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FingerprintStatus } from './FingerprintStatus';

describe('FingerprintStatus', () => {
  it('대기는 선 line·아이콘 foreground·글 foreground-muted이고 글을 status로 알린다', () => {
    const { container } = render(
      <FingerprintStatus status="waiting">지문 센서에 손가락을 대세요</FingerprintStatus>,
    );
    const status = screen.getByRole('status');

    expect(status).toHaveTextContent('지문 센서에 손가락을 대세요');
    expect(status).toHaveClass('text-label-14', 'text-foreground-muted');
    expect(container.firstChild).toHaveClass(
      'border',
      'border-line',
      'text-foreground',
      'rounded',
      'p-8',
      'gap-3',
    );
  });

  it('실패는 선·아이콘·글이 error이고 글을 alert로 알린다', () => {
    const { container } = render(
      <FingerprintStatus status="failed">지문을 확인하지 못했습니다</FingerprintStatus>,
    );
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('지문을 확인하지 못했습니다');
    expect(alert).not.toHaveClass('text-foreground-muted');
    expect(container.firstChild).toHaveClass('border-error', 'text-error');
  });

  it('아이콘은 40px 장식이고 선 굵기를 16px 아이콘과 같게 줄인다', () => {
    const { container } = render(<FingerprintStatus status="waiting">안내</FingerprintStatus>);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('size-10');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    // 40px에서 1.14286px이 되도록 viewBox(16) 단위로 1.14286 × 16 / 40
    expect(svg).toHaveAttribute('stroke-width', '0.457144');
  });
});

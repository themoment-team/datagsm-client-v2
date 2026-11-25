import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SessionTimer } from './SessionTimer';

describe('SessionTimer', () => {
  it('남은 시간을 "세션 만료까지 mm:ss"로 보여 준다', () => {
    render(<SessionTimer remainingSeconds={583} />);

    expect(screen.getByText('세션 만료까지 09:43')).toBeInTheDocument();
  });

  it('값이 바뀌면 다시 그리고 live region은 두지 않는다', () => {
    const { container, rerender } = render(<SessionTimer remainingSeconds={583} />);

    rerender(<SessionTimer remainingSeconds={0} />);

    expect(screen.getByText('세션 만료까지 00:00')).toBeInTheDocument();
    expect(container.querySelector('[aria-live], [role="timer"], [role="status"]')).toBeNull();
  });

  it('시계 아이콘은 장식으로 숨기고 className을 덧붙인다', () => {
    render(<SessionTimer remainingSeconds={583} className="mt-4" />);
    const timer = screen.getByText('세션 만료까지 09:43');

    expect(timer).toHaveClass('text-label-14', 'text-foreground-muted', 'mt-4');
    expect(timer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

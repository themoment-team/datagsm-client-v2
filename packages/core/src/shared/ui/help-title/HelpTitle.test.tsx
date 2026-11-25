import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HelpTitle } from './HelpTitle';

describe('HelpTitle', () => {
  it('연동 꺼짐 상태에서 배지를 표시하고 누르면 연동을 요청한다', () => {
    const onSync = vi.fn();
    const { rerender } = render(<HelpTitle synced={false} onSync={onSync} />);

    fireEvent.click(screen.getByRole('button', { name: '관련 문서 연동 꺼짐' }));

    expect(onSync).toHaveBeenCalledOnce();
    expect(screen.getByText('연동 꺼짐')).toBeInTheDocument();

    rerender(<HelpTitle synced onSync={onSync} />);

    expect(screen.getByRole('button', { name: '관련 문서' })).toHaveAttribute('type', 'button');
    expect(screen.queryByText('연동 꺼짐')).not.toBeInTheDocument();
  });
});

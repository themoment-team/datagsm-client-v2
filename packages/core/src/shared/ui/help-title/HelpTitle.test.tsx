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

    expect(screen.queryByText('연동 꺼짐')).not.toBeInTheDocument();
  });

  // 연동된 상태에서는 눌러도 할 일이 없어 누를 수 있는 것처럼 보이지 않게 버튼이 아닌 제목 글자로 그린다.
  it('연동된 상태에서는 버튼 없이 제목 글자만 그린다', () => {
    render(<HelpTitle synced onSync={vi.fn()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('관련 문서')).toHaveClass('text-title-24');
  });
});

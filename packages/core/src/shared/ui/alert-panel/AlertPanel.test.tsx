import { Button } from '@datagsm/core/shared/ui/button';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AlertPanel } from './AlertPanel';

describe('AlertPanel', () => {
  it('제목이 있는 영역에 단계, 본문과 액션을 표시한다', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <AlertPanel
        title="작업 확인"
        step="1 / 2"
        onClose={onClose}
        actions={<Button onClick={onConfirm}>확인</Button>}
      >
        <p>선택한 항목을 확인해 주세요.</p>
      </AlertPanel>,
    );

    const panel = within(screen.getByRole('region', { name: '작업 확인' }));

    expect(panel.getByRole('heading', { name: '작업 확인' })).toBeInTheDocument();
    expect(panel.getByText('1 / 2')).toBeInTheDocument();
    expect(panel.getByText('선택한 항목을 확인해 주세요.')).toBeInTheDocument();

    fireEvent.click(panel.getByRole('button', { name: '닫기' }));
    fireEvent.click(panel.getByRole('button', { name: '확인' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('단계와 닫기 없이 확인과 취소 버튼을 조합할 수 있다', () => {
    render(
      <AlertPanel
        title="작업 확인"
        actions={
          <>
            <Button variant="secondary">취소</Button>
            <Button>확인</Button>
          </>
        }
      />,
    );

    const panel = within(screen.getByRole('region', { name: '작업 확인' }));

    expect(panel.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '취소',
      '확인',
    ]);
    expect(panel.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
  });
});

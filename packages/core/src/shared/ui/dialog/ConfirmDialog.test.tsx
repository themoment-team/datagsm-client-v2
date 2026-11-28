import { useState } from 'react';

import { Button } from '@datagsm/core/shared/ui/button';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

interface ConfirmExampleProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  pending?: boolean;
}

// 확인하면 결과를 남기고 닫는 쓰는 쪽 예시다. ConfirmDialog는 스스로 닫지 않는다.
const ConfirmExample = ({
  onConfirm = () => {},
  onCancel = () => {},
  pending,
}: ConfirmExampleProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>삭제</Button>
      <ConfirmDialog
        open={open}
        title="‘급식 알리미 웹’을 삭제할까요?"
        step="1 / 1"
        confirmLabel="삭제"
        pending={pending}
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
        onCancel={() => {
          onCancel();
          setOpen(false);
        }}
      >
        이 클라이언트로 로그인하던 서비스는 더 이상 로그인할 수 없습니다.
      </ConfirmDialog>
    </>
  );
};

const openConfirm = async () => {
  const opener = screen.getByRole('button', { name: '삭제' });
  opener.focus();
  fireEvent.click(opener);
  const dialog = await screen.findByRole('alertdialog', { name: '‘급식 알리미 웹’을 삭제할까요?' });
  await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  return { opener, dialog };
};

it('alertdialog로 열고 본문을 설명으로 연결한다', async () => {
  render(<ConfirmExample />);

  const { dialog } = await openConfirm();

  expect(dialog).toHaveAccessibleDescription(
    '이 클라이언트로 로그인하던 서비스는 더 이상 로그인할 수 없습니다.',
  );
  expect(
    within(dialog)
      .getAllByRole('button')
      .map((button) => button.textContent),
  ).toEqual(['닫기', '취소', '삭제']);
});

it('확인을 누르면 onConfirm만 부르고, 닫으면 포커스를 연 버튼으로 돌려준다', async () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ConfirmExample onConfirm={onConfirm} onCancel={onCancel} />);

  const { opener, dialog } = await openConfirm();
  fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

  expect(onConfirm).toHaveBeenCalledOnce();
  expect(onCancel).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  await waitFor(() => expect(opener).toHaveFocus());
});

it.each([
  [
    '취소 버튼을 누르면',
    (dialog: HTMLElement) => fireEvent.click(within(dialog).getByRole('button', { name: '취소' })),
  ],
  [
    '닫기 버튼을 누르면',
    (dialog: HTMLElement) => fireEvent.click(within(dialog).getByRole('button', { name: '닫기' })),
  ],
  [
    'ESC를 누르면',
    () => fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }),
  ],
])('%s onCancel만 부른다', async (_, cancel) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ConfirmExample onConfirm={onConfirm} onCancel={onCancel} />);

  const { opener, dialog } = await openConfirm();
  cancel(dialog);

  expect(onCancel).toHaveBeenCalledOnce();
  expect(onConfirm).not.toHaveBeenCalled();
  await waitFor(() => expect(opener).toHaveFocus());
});

it('덮개를 눌러도 닫히지 않는다', async () => {
  const onCancel = vi.fn();
  render(<ConfirmExample onCancel={onCancel} />);

  await openConfirm();
  const backdrop = document.querySelector('.bg-scrim-card');
  expect(backdrop).not.toBeNull();
  fireEvent.pointerDown(backdrop!);
  fireEvent.mouseDown(backdrop!);
  fireEvent.click(backdrop!);

  expect(onCancel).not.toHaveBeenCalled();
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
});

it('처리하는 동안(pending) 확인 버튼을 막는다', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmExample onConfirm={onConfirm} pending />);

  const { dialog } = await openConfirm();
  const confirm = within(dialog).getByRole('button', { name: '삭제' });

  expect(confirm).toBeDisabled();
  fireEvent.click(confirm);
  expect(onConfirm).not.toHaveBeenCalled();
});

it('처리하는 동안(pending) 취소·닫기·ESC로 닫히지 않는다', async () => {
  const onCancel = vi.fn();
  render(<ConfirmExample onCancel={onCancel} pending />);

  const { dialog } = await openConfirm();
  const cancel = within(dialog).getByRole('button', { name: '취소' });

  expect(cancel).toBeDisabled();
  fireEvent.click(cancel);
  expect(within(dialog).queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

  expect(onCancel).not.toHaveBeenCalled();
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
});

import { useState } from 'react';

import { Button } from '@datagsm/core/shared/ui/button';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

const DialogExample = ({ onClose = () => {} }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const close = () => {
    onClose();
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Dialog
        open={open}
        onClose={close}
        title="API 키를 발급했습니다"
        step="1 / 1"
        actions={<Button onClick={close}>확인</Button>}
      >
        <p>이 키는 다시 볼 수 없습니다.</p>
      </Dialog>
    </>
  );
};

const openDialog = async () => {
  const opener = screen.getByRole('button', { name: '모달 열기' });
  opener.focus();
  fireEvent.click(opener);
  const dialog = await screen.findByRole('dialog', { name: 'API 키를 발급했습니다' });
  return { opener, dialog };
};

const expectClosedWithFocusOn = async (opener: HTMLElement) => {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(opener).toHaveFocus());
};

it('열면 제목을 이름으로 한 dialog에 단계·본문·액션을 그리고 포커스를 안으로 옮긴다', async () => {
  render(<DialogExample />);

  const { dialog } = await openDialog();
  const panel = within(dialog);

  expect(panel.getByRole('heading', { name: 'API 키를 발급했습니다' })).toBeInTheDocument();
  expect(panel.getByText('1 / 1')).toBeInTheDocument();
  expect(panel.getByText('이 키는 다시 볼 수 없습니다.')).toBeInTheDocument();
  // 모달 안에 이름 있는 region이 겹치지 않도록 AlertPanel의 section이 곧 dialog다.
  expect(panel.queryByRole('region')).not.toBeInTheDocument();
  await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
});

it.each([
  ['닫기 버튼을 누르면', () => fireEvent.click(screen.getByRole('button', { name: '닫기' }))],
  ['액션 버튼을 누르면', () => fireEvent.click(screen.getByRole('button', { name: '확인' }))],
  [
    'ESC를 누르면',
    () => fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }),
  ],
])('%s onClose를 부르고 포커스를 연 버튼으로 돌려준다', async (_, close) => {
  const onClose = vi.fn();
  render(<DialogExample onClose={onClose} />);

  const { opener } = await openDialog();
  await waitFor(() =>
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement),
  );
  close();

  expect(onClose).toHaveBeenCalledOnce();
  await expectClosedWithFocusOn(opener);
});

it('덮개(바깥)를 누르면 닫힌다', async () => {
  const onClose = vi.fn();
  render(<DialogExample onClose={onClose} />);

  const { opener } = await openDialog();
  const backdrop = document.querySelector('.bg-scrim-card');
  expect(backdrop).not.toBeNull();
  fireEvent.pointerDown(backdrop!);
  fireEvent.mouseDown(backdrop!);
  fireEvent.pointerUp(backdrop!);
  fireEvent.mouseUp(backdrop!);
  fireEvent.click(backdrop!);

  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  await expectClosedWithFocusOn(opener);
});

'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@datagsm/core/shared/ui/button';
import type { ReactNode } from 'react';

import { AlertPanelPopup } from './AlertPanelPopup';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  step?: string;
  // 무엇이 일어나는지 설명한다. 창의 설명(aria-describedby)으로 연결된다.
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  // 확인한 작업을 처리하는 동안 확인·취소 버튼을 막고 닫기 버튼을 숨기며 ESC도 무시한다.
  // 처리 결과가 나오기 전에 창이 닫히지 않게 하기 위해서다. 문구("삭제하는 중…")는 confirmLabel로 바꾼다.
  pending?: boolean;
  onConfirm: () => void;
  // 취소 버튼, 닫기 버튼, ESC에서 부른다(pending이면 부르지 않는다). 바깥 클릭으로는 닫히지 않는다(Base UI AlertDialog).
  onCancel: () => void;
}

// 삭제처럼 되돌릴 수 없는 작업을 확인하는 모달이다. Base UI AlertDialog(role="alertdialog")를 쓴다.
// Figma 삭제 확인: 취소(secondary) + 확인(primary)을 반씩 나눈다. 위험 동작도 따로 색을 두지 않고 primary다.
// 확인해도 스스로 닫지 않는다. Figma "삭제하는 중"처럼 처리하는 동안 창을 두었다가 쓰는 쪽이 open을 false로 닫는다.
// AppShell 안 화면에서만 쓴다. 덮개와 창 폭이 사이드바 폭(w-68)과 PanelLayout 칸 비율을 전제하므로
// AppShell 밖(oauth, client 랜딩)에서는 위치가 어긋난다.
// 닫기 버튼은 AlertPanel 공개 API를 그대로 두려고 pending 동안 onClose를 넘기지 않아 숨긴다.
export const ConfirmDialog = ({
  open,
  title,
  step,
  children,
  confirmLabel,
  cancelLabel = '취소',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <AlertDialog.Root
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen && !pending) onCancel();
    }}
  >
    <AlertPanelPopup
      title={title}
      step={step}
      onClose={pending ? undefined : onCancel}
      actions={
        <>
          <Button variant="secondary" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children != null && (
        <AlertDialog.Description render={<div className="flex flex-col gap-6" />}>
          {children}
        </AlertDialog.Description>
      )}
    </AlertPanelPopup>
  </AlertDialog.Root>
);

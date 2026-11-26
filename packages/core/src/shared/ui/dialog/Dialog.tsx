'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';

import { AlertPanelPopup } from './AlertPanelPopup';

interface DialogProps {
  open: boolean;
  // 닫기 버튼, ESC, 바깥 클릭에서 부른다. 쓰는 쪽은 여기서 open을 false로 바꾼다.
  onClose: () => void;
  title: string;
  step?: string;
  children?: ReactNode;
  actions: ReactNode;
}

// 결과 알림·수정 폼처럼 오른쪽 카드에 띄우는 일반 모달이다. 내용은 AlertPanel과 같은 props로 받는다.
// 열림은 쓰는 쪽이 제어한다. 열면 창 안 첫 버튼으로, 닫으면 열기 전에 포커스가 있던 요소(연 버튼)로 포커스를 옮긴다.
export const Dialog = ({ open, onClose, ...panelProps }: DialogProps) => (
  <BaseDialog.Root
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose();
    }}
  >
    <AlertPanelPopup {...panelProps} onClose={onClose} />
  </BaseDialog.Root>
);

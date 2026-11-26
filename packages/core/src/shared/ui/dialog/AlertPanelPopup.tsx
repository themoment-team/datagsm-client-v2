'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { AlertPanel } from '@datagsm/core/shared/ui/alert-panel';
import type { ComponentProps } from 'react';

type AlertPanelPopupProps = Pick<
  ComponentProps<typeof AlertPanel>,
  'title' | 'step' | 'children' | 'actions' | 'onClose'
>;

// Dialog와 ConfirmDialog가 함께 쓰는 덮개와 창이다. Base UI AlertDialog의 Portal·Backdrop·Popup은
// Dialog의 것을 그대로 다시 내보낸 것이라 두 Root 안에서 같은 부품을 쓴다.
// Figma "Flow 5 · 2. 삭제 확인 (오른쪽 카드)"(1101:210721)와 WF/Card scrim(927:2791)을 옮겼다.
// - 창: 화면 오른쪽 끝 2칸 카드 자리(폭 560)에 위아래 여백 없이 화면 높이만큼 고정한다. 넘치면 창 안에서 스크롤한다.
//   칠은 AlertPanel의 glass-fill이고, 뒤 화면이 비치지 않게 WF/Glass를 oauth AuthWindow처럼 backdrop-blur-lg로 옮겼다.
// - 덮개: 사이드바는 두고 사이드바와 창 사이(왼쪽 두 카드)만 scrim-card로 덮는다. 왼쪽 끝은 AppShell 사이드바 폭(w-72)과 맞춘다.
//   덮개 밖(사이드바)을 눌러도 Base UI가 바깥 클릭으로 본다. 모달이라 뒤 화면 조작과 문서 스크롤은 Base UI가 막는다.
// - 모션: Figma에 없어 넣지 않았다.
export const AlertPanelPopup = (panelProps: AlertPanelPopupProps) => (
  <BaseDialog.Portal>
    <BaseDialog.Backdrop className="fixed inset-y-0 right-140 left-72 z-40 bg-scrim-card" />
    <BaseDialog.Popup
      className="fixed inset-y-0 right-0 z-40 overflow-y-auto backdrop-blur-lg"
      render={(props) => <AlertPanel {...props} {...panelProps} />}
    />
  </BaseDialog.Portal>
);

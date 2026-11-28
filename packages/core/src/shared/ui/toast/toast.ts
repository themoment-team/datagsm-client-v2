import { createElement, type ReactNode } from 'react';

import { Toast } from '@base-ui/react/toast';
import { WarningCircleIcon } from '@datagsm/core/shared/ui/icon';

export interface ToastData {
  icon?: ReactNode;
}

interface ToastOptions extends ToastData {
  description?: ReactNode;
  // 자동으로 닫히기까지의 시간(ms). 기본 5000이고 0이면 자동으로 닫지 않는다.
  timeout?: number;
}

// 앱마다 하나인 전역 manager다. 루트 layout의 Toaster가 이 manager로 토스트를 그린다.
// React 밖(이벤트 핸들러, mutation 콜백)에서도 부를 수 있게 hook이 아니라 모듈 값으로 둔다.
export const toastManager = Toast.createToastManager<ToastData>();

// 토스트를 띄우고 id를 돌려준다. 아이콘을 주지 않으면 Figma 기본값인 check-circle을 쓴다(Toaster가 채운다).
// toast('API 키를 복사했습니다', { icon: <CopyIcon /> })
// 실패 알림은 toast.error를 쓴다. 기본 아이콘이 warning-circle이고, 화면 리더가 바로 읽도록 priority를 high로 둔다.
// toast.error('API 키를 삭제하지 못했습니다')
// toast.close(id)는 그 토스트를, id 없이 부르면 모두 닫는다.
export const toast = Object.assign(
  (title: ReactNode, { icon, ...options }: ToastOptions = {}) =>
    toastManager.add({ title, ...options, data: { icon } }),
  {
    // 이 파일은 .ts라 JSX 대신 createElement로 기본 아이콘을 만든다.
    error: (
      title: ReactNode,
      { icon = createElement(WarningCircleIcon), ...options }: ToastOptions = {},
    ) => toastManager.add({ title, ...options, type: 'error', priority: 'high', data: { icon } }),
    close: (id?: string) => toastManager.close(id),
  },
);

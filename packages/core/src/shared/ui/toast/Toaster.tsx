'use client';

import { useSyncExternalStore } from 'react';

import { Toast } from '@base-ui/react/toast';
import { CheckCircleIcon } from '@datagsm/core/shared/ui/icon';

import { type ToastData, toastManager } from './toast';

type ToastTheme = 'light' | 'dark';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};

// 토스트는 화면과 반대 모드로 보인다(라이트 화면 = 검은 토스트, 다크 화면 = 흰 토스트).
// 현재 화면 모드는 ThemeProvider의 스크립트와 ThemeToggle이 바꾸는 <html data-theme>을 직접 읽는다.
// shared는 features/theme-toggle의 useTheme을 import할 수 없어(FSD) 같은 방식으로 DOM 속성을 구독한다.
// data-theme이 없으면 기본 테마인 Light 화면으로 본다.
const getToastTheme = (): ToastTheme =>
  document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

// 서버는 사용자의 테마를 모른다. 토스트 영역은 Portal이라 브라우저에서 마운트된 뒤에만 그려지므로
// 서버 HTML에는 이 값이 들어가지 않고 hydration 경고도 나지 않는다.
const getServerToastTheme = (): ToastTheme => 'dark';

const ToastList = () => {
  const { toasts } = Toast.useToastManager<ToastData>();

  return toasts.map((item) => (
    <Toast.Root
      key={item.id}
      toast={item}
      swipeDirection="up"
      className="absolute inset-x-0 top-0 mx-auto flex w-fit max-w-full translate-x-(--toast-swipe-movement-x) translate-y-(--offset-y) items-center gap-3 rounded border border-glass-line bg-toast-fill p-4 text-foreground transition-opacity duration-300 ease-out select-none [--offset-y:calc(var(--toast-offset-y)+var(--toast-index)*0.5rem+var(--toast-swipe-movement-y))] after:absolute after:inset-x-0 after:top-full after:h-2 data-ending-style:opacity-0 data-limited:opacity-0 data-starting-style:opacity-0 data-swiping:transition-none motion-safe:transition-[opacity,translate] motion-safe:data-starting-style:-translate-y-full"
    >
      {item.data?.icon ?? <CheckCircleIcon />}
      <div className="flex min-w-0 flex-col">
        <Toast.Title className="text-label-14" />
        <Toast.Description className="text-caption-12 text-foreground-muted" />
      </div>
    </Toast.Root>
  ));
};

// Figma DataGSMv2 "WF/Toast"(node 745:2147)를 Base UI Toast로 옮겼다. 모든 앱의 루트 layout에 한 번 둔다.
// - 위치: 화면 위 가운데, 위 여백 24. 폭은 내용에 맞추고 화면 좌우 16을 넘지 않게 줄바꿈한다.
// - 모양: 안쪽 여백 16, 아이콘·글자 간격 12, 모서리 4, 선 glass-line, 칠 toast-fill.
//   글자는 제목 label-14(foreground), 내용 caption-12(foreground-muted). 아이콘은 16px이고 기본은 check-circle이다.
// - 여러 개: 새 토스트가 맨 위에 오고 앞의 토스트는 아래로 8 간격을 두고 밀린다. 한 번에 3개까지 보이고(Base UI 기본),
//   넘친 오래된 토스트는 숨긴다. 토스트 사이 8도 마우스가 머문 것으로 보도록 ::after로 메운다.
// - 동작: 5초 뒤 닫히고, 마우스를 올리거나 포커스가 가면 타이머가 멈춘다. 위로 밀어 닫는다. 닫기 버튼은 Figma에 없다.
//   스크린 리더 알림(live region)과 F6 이동은 Base UI 기본 동작이다.
// - 모션: Figma에 없어 위에서 내려오며 나타나고 흐려지며 사라지게 했다. 동작 줄이기 설정이면 투명도만 바꾼다.
export const Toaster = () => {
  const theme = useSyncExternalStore(subscribe, getToastTheme, getServerToastTheme);

  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Portal>
        <Toast.Viewport data-theme={theme} aria-label="알림" className="fixed inset-x-4 top-6 z-50">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
};

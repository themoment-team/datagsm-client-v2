'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { AlertPanel } from '@datagsm/core/shared/ui/alert-panel';
import { ScrollArea } from '@datagsm/core/shared/ui/scroll-area';
import type { ComponentProps } from 'react';

type AlertPanelPopupProps = Pick<
  ComponentProps<typeof AlertPanel>,
  'title' | 'step' | 'children' | 'actions' | 'onClose'
>;

// Dialog와 ConfirmDialog가 함께 쓰는 덮개와 창이다. Base UI AlertDialog의 Portal·Backdrop·Popup은
// Dialog의 것을 그대로 다시 내보낸 것이라 두 Root 안에서 같은 부품을 쓴다.
// Figma "Flow 5 · 2. 삭제 확인 (오른쪽 카드)"(1101:210721)와 WF/Card scrim(927:2791)을 옮겼다.
// - 창: PanelLayout 오른쪽 칸(560fr / 1648fr)과 같은 폭으로 화면 오른쪽 끝에 위아래 여백 없이 화면 높이만큼 고정한다.
//   폭은 PanelLayout과 같은 식이다. 본문 폭(화면 − 사이드바 w-68)과 PanelLayout 최소 폭 1264 중 큰 값의 560/1648.
//   그래서 1536 이상에서는 오른쪽 칸과 위치·폭이 같고, 더 좁으면 오른쪽 칸을 끝까지 가로 스크롤했을 때의 자리(폭 429.5)에 온다.
//   비율과 최소 폭을 PanelLayout에서 바꾸면 여기도 고친다. AlertPanelPopup.test.tsx가 둘이 어긋나면 실패한다.
//   칠은 AlertPanel의 glass-fill, 블러는 칸 배경과 같은 WF/Glass(backdrop-blur-glass)다.
// - 본문: 칸(Panel)처럼 머리는 위에 두고 본문만 ScrollArea로 스크롤한다. 바닥(버튼)은 본문 바로 아래에 오고,
//   본문이 넘치면 창 끝에 남는다. 스크롤 영역은 창 폭 전체를 써서 막대가 오른쪽 여백 안(끝에서 12px)에 온다.
//   AlertPanel의 본문 div는 줄어들지 않으므로(min-height: auto) 창에서 [&>div]:min-h-0으로 풀어 준다.
// - 덮개: 사이드바는 두고 사이드바와 창 사이(왼쪽 칸들)만 scrim-card로 덮는다. 왼쪽 끝은 AppSidebar 폭(w-68, 272)과 맞춘다.
//   덮개 밖(사이드바)을 눌러도 Base UI가 바깥 클릭으로 본다. 모달이라 뒤 화면 조작과 문서 스크롤은 Base UI가 막는다.
// - 모션: Figma에 없어 넣지 않았다.
export const AlertPanelPopup = ({ children, ...panelProps }: AlertPanelPopupProps) => (
  // 창 폭을 한 번만 적고 창 폭과 덮개 오른쪽 끝이 함께 쓴다. 100%는 쓰는 곳(fixed)의 기준인 화면 폭이다.
  <BaseDialog.Portal className="[--card-width:calc(max(1264px,100%_-_--spacing(68))*560/1648)]">
    <BaseDialog.Backdrop className="fixed inset-y-0 right-(--card-width) left-68 z-40 bg-scrim-card" />
    <BaseDialog.Popup
      className="fixed inset-y-0 right-0 z-40 w-(--card-width) max-w-none backdrop-blur-glass [&>div]:min-h-0"
      render={(props) => (
        <AlertPanel {...props} {...panelProps}>
          {children != null && (
            <ScrollArea
              scrollbarInset="panel"
              className="-mx-6"
              contentClassName="flex flex-col gap-6 px-6"
            >
              {children}
            </ScrollArea>
          )}
        </AlertPanel>
      )}
    />
  </BaseDialog.Portal>
);

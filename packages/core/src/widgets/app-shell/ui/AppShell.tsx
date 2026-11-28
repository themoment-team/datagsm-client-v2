import { IridescenceBackground } from '@datagsm/core/shared/ui/iridescence-background';
import { ScrollArea } from '@datagsm/core/shared/ui/scroll-area';
import type { ComponentProps } from 'react';

import { AppSidebar } from './AppSidebar';

type AppShellProps = ComponentProps<typeof AppSidebar> & {
  children: React.ReactNode;
};

// 모든 웹 앱이 같은 틀을 쓴다. 앱마다 다른 것은 메뉴 목록과 지금 앱뿐이다.
// 공통 배경(IridescenceBackground)도 여기서 깐다. 랜딩처럼 AppShell 밖에 둔 화면에는 배경이 없다.
// 페이지 높이는 화면 높이로 고정하고 페이지 자체는 스크롤하지 않는다. 사이드바는 늘 제자리에 있다.
// 본문만 스크롤 영역이다. PanelLayout 화면은 칸마다 스크롤되고, 화면이 지원 폭보다 좁으면 본문이 가로로 스크롤된다.
// PanelLayout을 쓰지 않는 화면(404 등)은 내용이 길면 본문이 세로로 스크롤된다.
// 본문 내용 상자는 본문 높이를 채우는 세로 flex다. 셸 안 페이지는 min-h-screen(100vh) 대신 flex-1로 높이를 채운다.
// 100vh는 모바일 주소창이 있을 때 h-dvh보다 커서 본문이 쓸데없이 스크롤되기 때문이다.
export const AppShell = ({ children, ...sidebarProps }: AppShellProps) => {
  return (
    <div className="flex h-dvh overflow-hidden">
      <IridescenceBackground />
      <AppSidebar {...sidebarProps} />
      <ScrollArea
        orientation="both"
        className="min-w-0 flex-1"
        contentClassName="flex min-h-full flex-col"
        label="본문"
      >
        {children}
      </ScrollArea>
    </div>
  );
};

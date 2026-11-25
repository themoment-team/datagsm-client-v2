import type { ComponentProps } from 'react';

import { IridescenceBackground } from '../../../shared/ui/iridescence-background';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { AppSidebar } from './AppSidebar';

type AppShellProps = ComponentProps<typeof AppSidebar> & {
  children: React.ReactNode;
};

// 모든 웹 앱이 같은 틀을 쓴다. 앱마다 다른 것은 메뉴 목록과 지금 앱뿐이다.
// 공통 배경(IridescenceBackground)도 여기서 깐다. 랜딩처럼 AppShell 밖에 둔 화면에는 배경이 없다.
// 페이지 높이는 화면 높이로 고정하고 페이지 자체는 스크롤하지 않는다. 사이드바는 늘 제자리에 있다.
// 본문만 스크롤 영역이다. PanelLayout 화면은 칸마다 스크롤되고, 화면이 지원 폭보다 좁으면 본문이 가로로 스크롤된다.
// PanelLayout을 쓰지 않는 화면(404 등)은 내용이 길면 본문이 세로로 스크롤된다.
export const AppShell = ({ children, ...sidebarProps }: AppShellProps) => {
  return (
    <div className="flex h-dvh overflow-hidden">
      <IridescenceBackground />
      <AppSidebar {...sidebarProps} />
      <ScrollArea orientation="both" className="min-w-0 flex-1">
        {children}
      </ScrollArea>
    </div>
  );
};

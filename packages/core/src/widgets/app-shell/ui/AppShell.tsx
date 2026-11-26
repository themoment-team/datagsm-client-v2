import type { ComponentProps } from 'react';

import { IridescenceBackground } from '../../../shared/ui/iridescence-background';
import { AppSidebar } from './AppSidebar';

type AppShellProps = ComponentProps<typeof AppSidebar> & {
  children: React.ReactNode;
};

// 모든 웹 앱이 같은 틀을 쓴다. 앱마다 다른 것은 메뉴 목록과 지금 앱뿐이다.
// 공통 배경(IridescenceBackground)도 여기서 깐다. 랜딩처럼 AppShell 밖에 둔 화면에는 배경이 없다.
export const AppShell = ({ children, ...sidebarProps }: AppShellProps) => {
  return (
    <div className="flex min-h-screen">
      <IridescenceBackground />
      <AppSidebar {...sidebarProps} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

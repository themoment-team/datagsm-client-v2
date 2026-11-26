'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '../../../features/logout';
import type { AppUrls } from '../../../shared/config';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { getSidebarItemHref, isSidebarItemActive } from '../lib/sidebarLink';
import type { SidebarItem } from '../model/sidebarItem';

interface AppSidebarProps {
  currentApp: SidebarItem['app'];
  appUrls: Partial<AppUrls>;
  items: SidebarItem[];
  footerItems: SidebarItem[];
  // 로고 옆에 붙는 표시다. 관리자 웹은 '관리자'를 넘긴다.
  badge?: string;
  // 로그인하는 앱(client, admin)만 넘긴다. 넘기면 계정 메뉴 끝에 로그아웃 버튼을 둔다.
  // 공개 앱(docs, status, projects)은 로그인 상태를 모르므로 로그아웃 버튼이 없다.
  idpLogoutUrl?: string;
}

interface SidebarLinkProps {
  item: SidebarItem;
  currentApp: SidebarItem['app'];
  appUrls: Partial<AppUrls>;
  pathname: string;
}

const SidebarLink = ({ item, currentApp, appUrls, pathname }: SidebarLinkProps) => {
  const { href, external } = getSidebarItemHref(item, currentApp, appUrls);
  const isActive = isSidebarItemActive(item, currentApp, pathname);
  // 지금은 레이아웃만 잡는다. 색·선택 표시 같은 스타일은 디자인 토큰이 정해지면 aria-current를 기준으로 붙인다.
  const className = 'flex items-center gap-3 px-4 py-3';

  // 다른 앱은 다른 배포라서 Link의 앱 안 이동·미리 불러오기가 동작하지 않는다. 일반 링크로 이동한다.
  if (external) {
    return (
      <a href={href} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-current={isActive ? 'page' : undefined}>
      {item.label}
    </Link>
  );
};

export const AppSidebar = ({
  currentApp,
  appUrls,
  items,
  footerItems,
  badge,
  idpLogoutUrl,
}: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    // 폭 272(w-68)는 Figma WF/Sidebar 값이다. PanelLayout의 최소 폭이 이 폭을 기준으로 계산되어 있다.
    // 화면 높이가 메뉴보다 낮을 때(크게 확대했을 때 등)는 사이드바 안에서 스크롤된다.
    // 브라우저 기본 스크롤바는 폭을 차지하고 디자인과 달라서 공용 ScrollArea를 쓴다.
    <aside className="flex h-full w-68 shrink-0 flex-col">
      <ScrollArea className="flex-1" contentClassName="flex min-h-full flex-col px-5 py-8">
        <div className="flex items-center justify-between gap-2 px-4">
          <p>DATA GSM</p>
          {badge && <span>{badge}</span>}
        </div>
        <nav aria-label="주 메뉴" className="mt-10 flex flex-col gap-1">
          {items.map((item) => (
            <SidebarLink
              key={`${item.app}${item.path}`}
              item={item}
              currentApp={currentApp}
              appUrls={appUrls}
              pathname={pathname}
            />
          ))}
        </nav>
        <nav aria-label="계정 메뉴" className="mt-auto flex flex-col gap-1">
          {footerItems.map((item) => (
            <SidebarLink
              key={`${item.app}${item.path}`}
              item={item}
              currentApp={currentApp}
              appUrls={appUrls}
              pathname={pathname}
            />
          ))}
          {idpLogoutUrl && (
            <LogoutButton
              idpLogoutUrl={idpLogoutUrl}
              className="flex items-center gap-3 px-4 py-3"
            />
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
};

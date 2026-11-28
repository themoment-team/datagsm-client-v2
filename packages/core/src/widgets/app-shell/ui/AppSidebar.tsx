'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@datagsm/core/features/logout';
import type { AppUrls } from '@datagsm/core/shared/config';
import { Badge } from '@datagsm/core/shared/ui/badge';
import { Brand } from '@datagsm/core/shared/ui/brand';
import { LogoutIcon } from '@datagsm/core/shared/ui/icon';
import { ScrollArea } from '@datagsm/core/shared/ui/scroll-area';

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

// Figma "WF/Sidebar" 메뉴 한 줄. 높이 40, 좌우 16, 아이콘과 글자 사이 12, 글자 label-14, 기본은 text-muted다.
// 선택된 메뉴(aria-current="page")는 칸과 같은 유리 면(glass-fill + WF/Glass 블러 + glass-line 1px)에 글자·아이콘이 text다.
// 선은 Figma처럼 안쪽 선(ring-inset)이라 선택돼도 글자 위치가 움직이지 않는다.
// 아이콘은 currentColor라서 글자색을 함께 따른다. 로그아웃 버튼도 같은 모양을 쓴다.
const sidebarItemClassName =
  'flex h-10 w-full cursor-pointer items-center gap-3 rounded px-4 text-left text-label-14 text-foreground-muted not-aria-[current=page]:hover:bg-hover aria-[current=page]:bg-glass-fill aria-[current=page]:text-foreground aria-[current=page]:ring-1 aria-[current=page]:ring-glass-line aria-[current=page]:backdrop-blur-glass aria-[current=page]:ring-inset';

const SidebarLink = ({ item, currentApp, appUrls, pathname }: SidebarLinkProps) => {
  const { href, external } = getSidebarItemHref(item, currentApp, appUrls);
  const isActive = isSidebarItemActive(item, currentApp, pathname);

  // 다른 앱은 다른 배포라서 Link의 앱 안 이동·미리 불러오기가 동작하지 않는다. 일반 링크로 이동한다.
  if (external) {
    return (
      <a href={href} className={sidebarItemClassName}>
        {item.icon}
        {item.label}
      </a>
    );
  }

  return (
    <Link href={href} className={sidebarItemClassName} aria-current={isActive ? 'page' : undefined}>
      {item.icon}
      {item.label}
    </Link>
  );
};

// Figma DataGSMv2 "WF/Sidebar"(node 536:7102).
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
    <aside className="flex h-full w-68 shrink-0 flex-col border-r border-line">
      <ScrollArea
        className="flex-1"
        contentClassName="flex min-h-full flex-col justify-between gap-4 p-4"
      >
        {/* 브랜드 아래 12, 메뉴 사이 4는 Figma group 간격이다. */}
        <div className="flex flex-col gap-1">
          {/* 관리자 배지는 Figma "WF/Admin sidebar"처럼 브랜드 바로 옆(8)에 붙는다. */}
          <div className="flex items-center gap-2 pb-3">
            <Brand />
            {badge && <Badge>{badge}</Badge>}
          </div>
          <nav aria-label="주 메뉴" className="flex flex-col gap-1">
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
        </div>
        <nav aria-label="계정 메뉴" className="flex flex-col gap-1">
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
            <LogoutButton idpLogoutUrl={idpLogoutUrl} className={sidebarItemClassName}>
              <LogoutIcon />
              로그아웃
            </LogoutButton>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
};

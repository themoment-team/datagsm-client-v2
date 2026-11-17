import type { AppUrls } from '../../../shared/config';
import type { SidebarItem } from '../model/sidebarItem';

type CurrentApp = SidebarItem['app'];

// 앱의 루트 메뉴('/')는 그 앱 어디에 있든 선택된 것으로 본다. 그 밖의 메뉴는 경로가 같거나 그 하위일 때 선택된다.
export const isSidebarItemActive = (
  item: SidebarItem,
  currentApp: CurrentApp,
  pathname: string,
) => {
  if (item.app !== currentApp) {
    return false;
  }

  if (item.path === '/') {
    return true;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

// 다른 앱으로 가는 메뉴만 주소가 필요하다. 주소를 모르는 앱(admin)으로 가는 메뉴는 만들지 않는다.
export const getSidebarItemHref = (
  item: SidebarItem,
  currentApp: CurrentApp,
  appUrls: Partial<AppUrls>,
) => {
  if (item.app === currentApp) {
    return { href: item.path, external: false };
  }

  const baseUrl = item.app === 'admin' ? undefined : appUrls[item.app];

  if (!baseUrl) {
    throw new Error(`사이드바 메뉴 '${item.label}'의 앱(${item.app}) 주소가 없습니다.`);
  }

  return { href: item.path === '/' ? baseUrl : `${baseUrl}${item.path}`, external: true };
};

import type { AppId } from '../../../shared/config';

export interface SidebarItem {
  label: string;
  // 이 메뉴가 속한 앱이다. 지금 앱과 같으면 앱 안에서 이동하고, 다르면 그 앱 주소로 이동한다.
  app: AppId | 'admin';
  // 앱 안의 경로다. /로 시작한다.
  path: string;
}

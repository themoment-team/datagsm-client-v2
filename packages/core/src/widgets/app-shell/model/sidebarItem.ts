import type { AppId } from '@datagsm/core/shared/config';
import type { ReactNode } from 'react';

export interface SidebarItem {
  label: string;
  // 이 메뉴가 속한 앱이다. 지금 앱과 같으면 앱 안에서 이동하고, 다르면 그 앱 주소로 이동한다.
  app: AppId | 'admin';
  // 앱 안의 경로다. /로 시작한다.
  path: string;
  // 글자 왼쪽의 16px 아이콘이다(<ModuleIcon /> 등). 색은 메뉴 글자색을 따른다.
  // 메뉴 목록은 서버 레이아웃에서 클라이언트 사이드바로 넘어가므로 컴포넌트가 아니라 요소로 넘긴다.
  icon?: ReactNode;
}

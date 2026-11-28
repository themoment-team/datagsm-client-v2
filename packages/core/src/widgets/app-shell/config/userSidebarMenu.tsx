import {
  BellIcon,
  BookIcon,
  FolderIcon,
  HeartRateIcon,
  KeyIcon,
  LoginIcon,
  ModuleIcon,
  UserIcon,
} from '@datagsm/core/shared/ui/icon';

import type { SidebarItem } from '../model/sidebarItem';

// client·docs·status·projects가 함께 쓰는 사용자 메뉴다. 관리자 웹은 같은 틀에 자기 메뉴를 넘긴다.
// 아이콘은 Figma DataGSMv2 "WF/Sidebar"(node 536:7102)의 메뉴별 아이콘이다.
export const USER_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: '애플리케이션', app: 'client', path: '/applications', icon: <ModuleIcon /> },
  { label: 'OAuth 클라이언트', app: 'client', path: '/clients', icon: <LoginIcon /> },
  { label: 'API 키', app: 'client', path: '/api-keys', icon: <KeyIcon /> },
  { label: '이벤트', app: 'client', path: '/events', icon: <BellIcon /> },
  { label: '프로젝트', app: 'projects', path: '/', icon: <FolderIcon /> },
  { label: '서비스 상태', app: 'status', path: '/', icon: <HeartRateIcon /> },
  { label: '문서', app: 'docs', path: '/', icon: <BookIcon /> },
];

export const USER_SIDEBAR_FOOTER_ITEMS: SidebarItem[] = [
  { label: '내 정보', app: 'client', path: '/me', icon: <UserIcon /> },
];

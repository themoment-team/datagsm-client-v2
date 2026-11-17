import type { SidebarItem } from '../model/sidebarItem';

// client·docs·status·projects가 함께 쓰는 사용자 메뉴다. 관리자 웹은 같은 틀에 자기 메뉴를 넘긴다.
export const USER_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: '애플리케이션', app: 'client', path: '/applications' },
  { label: 'OAuth 클라이언트', app: 'client', path: '/clients' },
  { label: 'API 키', app: 'client', path: '/api-keys' },
  { label: '이벤트', app: 'client', path: '/events' },
  { label: '프로젝트', app: 'projects', path: '/' },
  { label: '서비스 상태', app: 'status', path: '/' },
  { label: '문서', app: 'docs', path: '/' },
];

export const USER_SIDEBAR_FOOTER_ITEMS: SidebarItem[] = [
  { label: '내 정보', app: 'client', path: '/me' },
  { label: '로그아웃', app: 'client', path: '/logout' },
];

import type { SidebarItem } from '@datagsm/core/widgets/app-shell';

// 관리자 웹 전용 메뉴다. 틀은 다른 앱과 같은 core의 AppShell을 쓴다.
export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: '학생 관리', app: 'admin', path: '/students' },
  { label: '계정 관리', app: 'admin', path: '/accounts' },
  { label: '선생님 승인', app: 'admin', path: '/teacher-approvals' },
  { label: '동아리 관리', app: 'admin', path: '/clubs' },
  { label: '프로젝트 관리', app: 'admin', path: '/projects' },
  { label: 'API 키 관리', app: 'admin', path: '/api-keys' },
];

// 로그아웃은 메뉴 항목이 아니라 AppShell의 idpLogoutUrl로 붙는 버튼이다.
export const ADMIN_SIDEBAR_FOOTER_ITEMS: SidebarItem[] = [];

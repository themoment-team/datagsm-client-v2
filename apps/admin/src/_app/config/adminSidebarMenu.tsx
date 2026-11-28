import {
  CheckCircleIcon,
  EditIcon,
  FolderIcon,
  KeyIcon,
  ModuleIcon,
  ShieldIcon,
  UserIcon,
} from '@datagsm/core/shared/ui/icon';
import type { SidebarItem } from '@datagsm/core/widgets/app-shell';

// 관리자 웹 전용 메뉴다. 틀은 다른 앱과 같은 core의 AppShell을 쓴다.
// 메뉴와 아이콘은 Figma DataGSMv2 "WF/Admin sidebar"(node 879:1897)를 따른다.
export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: '학생 관리', app: 'admin', path: '/students', icon: <UserIcon /> },
  { label: '정보 변경 심사', app: 'admin', path: '/info-change-reviews', icon: <EditIcon /> },
  { label: '계정 관리', app: 'admin', path: '/accounts', icon: <ShieldIcon /> },
  { label: '선생님 승인', app: 'admin', path: '/teacher-approvals', icon: <CheckCircleIcon /> },
  { label: '동아리 관리', app: 'admin', path: '/clubs', icon: <ModuleIcon /> },
  { label: '프로젝트 관리', app: 'admin', path: '/projects', icon: <FolderIcon /> },
  { label: '프로젝트 심사', app: 'admin', path: '/project-reviews', icon: <CheckCircleIcon /> },
  { label: 'API 키 관리', app: 'admin', path: '/api-keys', icon: <KeyIcon /> },
];

// 로그아웃은 메뉴 항목이 아니라 AppShell의 idpLogoutUrl로 붙는 버튼이다.
export const ADMIN_SIDEBAR_FOOTER_ITEMS: SidebarItem[] = [];

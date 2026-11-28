import { USER_SIDEBAR_FOOTER_ITEMS, USER_SIDEBAR_ITEMS } from '@datagsm/core/widgets/app-shell';

// 콘솔 경로는 사이드바에 있는 이 앱(client) 메뉴의 경로다. proxy.ts matcher가 로그인을 확인하는 경로와 같다.
export const CONSOLE_PATHS: readonly string[] = [
  ...USER_SIDEBAR_ITEMS,
  ...USER_SIDEBAR_FOOTER_ITEMS,
]
  .filter((item) => item.app === 'client')
  .map((item) => item.path);

// 콘솔 메뉴 경로 자체이거나 그 아래 경로면 true다. '/clients-old'처럼 이름만 이어지는 경로는 콘솔이 아니다.
export const isConsolePath = (pathname: string) =>
  CONSOLE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

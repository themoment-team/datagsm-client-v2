import { buildIdpLogoutUrl } from '@datagsm/core/shared/auth/server';
import { toAppUrls } from '@datagsm/core/shared/config';
import {
  AppShell,
  USER_SIDEBAR_FOOTER_ITEMS,
  USER_SIDEBAR_ITEMS,
} from '@datagsm/core/widgets/app-shell';

import { env } from '@/shared/config';

// 랜딩(/)을 뺀 모든 화면의 레이아웃이다. app/(shell) 아래의 라우트만 사이드바와 공통 배경을 쓴다.
export const ShellLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <AppShell
    currentApp="client"
    appUrls={toAppUrls(env)}
    items={USER_SIDEBAR_ITEMS}
    footerItems={USER_SIDEBAR_FOOTER_ITEMS}
    idpLogoutUrl={buildIdpLogoutUrl(env)}
  >
    {children}
  </AppShell>
);

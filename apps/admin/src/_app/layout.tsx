import { AppShell } from '@datagsm/core/widgets/app-shell';
import type { Metadata } from 'next';

import { ADMIN_SIDEBAR_FOOTER_ITEMS, ADMIN_SIDEBAR_ITEMS } from '@/_app/config';
import { TanStackProvider } from '@/_app/providers';

import '@/_app/styles/globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Admin',
  description: 'DataGSM 관리자 애플리케이션',
};

export const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko">
      <body className="bg-background text-foreground antialiased">
        <TanStackProvider>
          {/* 관리자 메뉴는 모두 이 앱 안 경로라 다른 앱 주소가 필요 없다. */}
          <AppShell
            currentApp="admin"
            appUrls={{}}
            items={ADMIN_SIDEBAR_ITEMS}
            footerItems={ADMIN_SIDEBAR_FOOTER_ITEMS}
            badge="관리자"
          >
            {children}
          </AppShell>
        </TanStackProvider>
      </body>
    </html>
  );
};

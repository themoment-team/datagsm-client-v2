import { buildIdpLogoutUrl } from '@datagsm/core/shared/auth/server';
import { toAppUrls } from '@datagsm/core/shared/config';
import {
  AppShell,
  USER_SIDEBAR_FOOTER_ITEMS,
  USER_SIDEBAR_ITEMS,
} from '@datagsm/core/widgets/app-shell';
import type { Metadata } from 'next';

import { TanStackProvider } from '@/_app/providers';
import { env } from '@/shared/config';

import '@/_app/styles/globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Client',
  description: 'DataGSM 클라이언트 애플리케이션',
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
          <AppShell
            currentApp="client"
            appUrls={toAppUrls(env)}
            items={USER_SIDEBAR_ITEMS}
            footerItems={USER_SIDEBAR_FOOTER_ITEMS}
            idpLogoutUrl={buildIdpLogoutUrl(env)}
          >
            {children}
          </AppShell>
        </TanStackProvider>
      </body>
    </html>
  );
};

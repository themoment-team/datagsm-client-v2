import { ThemeProvider } from '@datagsm/core/features/theme-toggle';
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
  title: 'DataGSM Docs',
  description: 'DataGSM 기술 문서',
};

export const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <TanStackProvider>
            <AppShell
              currentApp="docs"
              appUrls={toAppUrls(env)}
              items={USER_SIDEBAR_ITEMS}
              footerItems={USER_SIDEBAR_FOOTER_ITEMS}
            >
              {children}
            </AppShell>
          </TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

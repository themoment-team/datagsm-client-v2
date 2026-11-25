import { ThemeProvider } from '@datagsm/core/features/theme-toggle';
import { IridescenceBackground } from '@datagsm/core/shared/ui/iridescence-background';
import type { Metadata } from 'next';

import { TanStackProvider } from '@/_app/providers';

import '@/_app/styles/globals.css';

export const metadata: Metadata = {
  title: 'DataGSM OAuth',
  description: 'DataGSM OAuth 애플리케이션',
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
          {/* oauth는 AppShell을 쓰지 않아 공통 배경을 여기서 깐다. */}
          <IridescenceBackground />
          <TanStackProvider>{children}</TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

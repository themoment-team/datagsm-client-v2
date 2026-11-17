import type { Metadata } from 'next';

import { MockProvider, TanStackProvider } from '@/_app/providers';

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
        <MockProvider>
          <TanStackProvider>{children}</TanStackProvider>
        </MockProvider>
      </body>
    </html>
  );
};

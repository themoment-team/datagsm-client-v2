import type { Metadata } from 'next';

import { MockProvider, TanStackProvider } from '@/_app/providers';

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
    <html lang="ko">
      <body className="bg-background text-foreground antialiased">
        <MockProvider>
          <TanStackProvider>{children}</TanStackProvider>
        </MockProvider>
      </body>
    </html>
  );
};

import { ThemeProvider } from '@datagsm/core/features/theme-toggle';
import type { Metadata } from 'next';

import { TanStackProvider } from '@/_app/providers';

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
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          {/* 사이드바와 공통 배경은 app/(shell)의 ShellLayout이 깐다. 랜딩(/)은 그 밖에 있어 둘 다 없다.
              오류·404 화면도 사이드바가 남도록 (shell)/error.tsx와 루트 not-found.tsx가 ShellLayout을 쓴다. */}
          <TanStackProvider>{children}</TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

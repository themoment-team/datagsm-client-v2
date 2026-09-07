import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import '@datagsm/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Admin',
  description: 'DataGSM 관리자 애플리케이션',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}

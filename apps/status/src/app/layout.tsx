import '@datagsm/ui/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: 'DataGSM Status',
  description: 'DataGSM 상태 애플리케이션',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}

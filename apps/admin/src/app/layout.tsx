import type { Metadata } from 'next';

import { Providers } from './providers';

import '@datagsm/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Admin',
  description: 'DataGSM 관리자 애플리케이션',
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

import type { Metadata } from 'next';

import { Providers } from './providers';

import '@datagsm/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Docs',
  description: 'DataGSM 기술 문서',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

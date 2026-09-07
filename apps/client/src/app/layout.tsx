import type { Metadata } from 'next';

import '@datagsm/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Client',
  description: 'DataGSM 클라이언트 애플리케이션',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;

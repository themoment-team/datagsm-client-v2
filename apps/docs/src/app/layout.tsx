import type { Metadata } from 'next';

import '@datagsm/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataGSM Docs',
  description: 'DataGSM 기술 문서',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;

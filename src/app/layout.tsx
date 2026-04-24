import type { Metadata } from 'next';

import 'styles/global.scss';

// PROJECT IMPORTS
import ProviderWrapper from './ProviderWrapper';

export const metadata: Metadata = {
  title: 'CRM Điện',
  description: 'CRM Điện'
};

export default function RootLayout({ children }: { children: React.ReactElement }) {
  return (
    <html lang="vi">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}

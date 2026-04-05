import './globals.css';
import QueryProvider from './QueryProvider';
import { AuthProviderWrapper } from './AuthProviderWrapper';
import { SocketProviderWrapper } from './SocketProviderWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tapestry Player Portal',
  description: 'Access your stories, products, and tables on the go',
  manifest: '/site.webmanifest',
  themeColor: '#D4AF37',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tapestry TTRPG',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProviderWrapper>
            <SocketProviderWrapper>{children}</SocketProviderWrapper>
          </AuthProviderWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}

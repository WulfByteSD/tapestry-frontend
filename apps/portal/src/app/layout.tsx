import type { Metadata, Viewport } from 'next';
import '@tapestry/styles/index.scss';
import './global.scss';
import { SiteShell } from '@/layout/siteShell/SiteShell.layout';
import QueryProvider from './QueryProvider';

export const metadata: Metadata = {
  title: 'Tapestry',
  description: 'The public portal for Tapestry tabletop roleplaying.',
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tapestry',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#D4AF37',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}

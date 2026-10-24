'use client';

import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { Footer } from '@/layout/footer/Footer.layout';
import { Navbar } from '@/layout/navbar/Navbar.layout';
import styles from './SiteShell.module.scss';
import NextTopLoader from 'nextjs-toploader';

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <div className={styles.shell}>
      <Navbar isMobileMenuOpen={isMobileMenuOpen} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} onCloseMobileMenu={closeMobileMenu} />
      <div className={styles.content} inert={isMobileMenuOpen}>
        <NextTopLoader color="var(--ui-accent)" height={3} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px var(--ui-accent),0 0 5px var(--ui-accent)" />
        {children}
      </div>
      <div inert={isMobileMenuOpen}>
        <Footer />
      </div>
    </div>
  );
}

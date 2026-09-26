'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={styles.shell}>
      <Navbar isMobileMenuOpen={isMobileMenuOpen} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className={styles.content}>
        <NextTopLoader color="var(--ui-accent)" height={3} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px var(--ui-accent),0 0 5px var(--ui-accent)" />
        {children}
      </div>
      <Footer />
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import PortalHeader from '@/components/portalHeader/PortalHeader.component';
import BottomNav from '@/components/bottomNav/BottomNav.component';
import styles from './PortalMobile.module.scss';

type Props = {
  children: React.ReactNode;
};

export default function PortalMobile({ children }: Props) {
  const pathname = usePathname();

  // Check if current route is a game board (full-bleed layout)
  const isGameBoard = pathname?.match(/^\/games\/[^/]+\/board$/);

  return (
    <div className={styles.shell}>
      <PortalHeader />
      <main className={styles.main} data-fullbleed={isGameBoard ? 'true' : undefined}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

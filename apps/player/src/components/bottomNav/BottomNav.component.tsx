'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiHome } from 'react-icons/bi';
import { GiDiceTarget } from 'react-icons/gi';
import styles from './BottomNav.module.scss';

// Core mobile navigation - only the most essential items
const coreNavItems = [
  { href: '/', label: 'Home', icon: <BiHome /> },
  { href: '/games', label: 'Games', icon: <GiDiceTarget /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {coreNavItems.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`${styles.link} ${active ? styles.active : ''}`}>
              <span className={styles.icon}>{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

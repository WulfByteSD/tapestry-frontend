'use client';

import type { ReactNode } from 'react';
import styles from './BoardLayout.module.scss';

type Props = {
  header: ReactNode;
  nav: ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
};

export default function BoardLayout({ header, nav, main, sidebar }: Props) {
  return (
    <div className={styles.board}>
      <div className={styles.header}>{header}</div>
      <nav className={styles.nav}>{nav}</nav>
      <main className={styles.main}>{main}</main>
      <aside className={styles.sidebar}>{sidebar}</aside>
    </div>
  );
}

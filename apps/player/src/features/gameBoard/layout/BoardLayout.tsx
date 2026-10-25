'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@tapestry/ui';
import styles from './BoardLayout.module.scss';

type HeaderControls = { tableOpen: boolean; onToggleTable: () => void };
type NavControls = { expanded: boolean; mobile: boolean; onToggleExpanded: () => void };
type Props = {
  header: (controls: HeaderControls) => ReactNode;
  nav: (controls: NavControls) => ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
};

export default function BoardLayout({ header, nav, main, sidebar }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const tableOpenerRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  const [navChoice, setNavChoice] = useState<boolean | null>(null);
  const [tableChoice, setTableChoice] = useState<boolean | null>(null);
  const wide = width >= 1200;
  const mobile = width < 700;
  const navExpanded = navChoice ?? wide;
  const tableOpen = tableChoice ?? wide;

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (tableOpen && !wide && !drawer.open) {
      tableOpenerRef.current = document.activeElement as HTMLElement;
      drawer.showModal();
    }
    else if ((!tableOpen || wide) && drawer.open) drawer.close();
  }, [tableOpen, wide]);

  const toggleTable = () => {
    setTableChoice(!tableOpen);
  };

  return (
    <div ref={boardRef} className={styles.board} data-mobile={mobile} data-nav-expanded={navExpanded} data-table-visible={wide && tableOpen}>
      <div className={styles.header}>{header({ tableOpen, onToggleTable: toggleTable })}</div>
      <nav className={styles.nav} aria-label="Game board zones">
        {nav({ expanded: navExpanded, mobile, onToggleExpanded: () => setNavChoice(!navExpanded) })}
      </nav>
      <div className={styles.main} id="board-zone-content">{main}</div>
      {wide ? (
        <aside className={styles.sidebar} id="board-table-panel" aria-label="Table panel" hidden={!tableOpen}>{sidebar}</aside>
      ) : (
        <dialog
          ref={drawerRef}
          id="board-table-panel"
          className={styles.drawer}
          aria-labelledby="board-table-title"
          onClose={(event) => {
            if (event.target !== event.currentTarget) return;
            setTableChoice(false);
            tableOpenerRef.current?.focus();
          }}
        >
          <div className={styles.drawerHeader}>
            <h2 id="board-table-title">At the table</h2>
            <Button type="button" variant="outline" tone="gold" autoFocus onClick={() => setTableChoice(false)}>Close</Button>
          </div>
          <div className={styles.drawerBody}>{sidebar}</div>
        </dialog>
      )}
    </div>
  );
}

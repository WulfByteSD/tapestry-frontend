import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './PublicCharacterSheet.module.scss';

export function PublicSheetState({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <main className={styles.page} aria-labelledby="character-title">
      <div className={styles.state}>
        <p className={styles.eyebrow}>Shared character sheet</p>
        <h1 id="character-title">{title}</h1>
        <p>{message}</p>
        <div className={styles.stateActions}>{children}<Link href="/">Back to Tapestry</Link></div>
      </div>
    </main>
  );
}

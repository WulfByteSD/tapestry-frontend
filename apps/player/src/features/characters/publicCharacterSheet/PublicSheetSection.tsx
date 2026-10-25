import type { ReactNode } from 'react';
import styles from './PublicCharacterSheet.module.scss';

export function PublicSheetSection({ id, title, children, className = '' }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`${styles.section} ${className}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

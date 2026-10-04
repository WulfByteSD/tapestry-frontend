import { Button } from '@tapestry/ui';
import { getProtection } from './CharacterSheet.helpers';
import type { CharacterResourcesProps } from './CharacterPlay.types';
import styles from './CharacterPlay.module.scss';
export function CharacterResources({ sheet, onAction, onNavigate }: CharacterResourcesProps) {
  const hp = sheet.sheet.resources?.hp;
  const threads = sheet.sheet.resources?.threads;
  return <section className={styles.resourceStrip} aria-label="Character resources">
    <Button variant="ghost" className={`${styles.resourceButton} ${styles.health}`} onClick={() => onAction('hp')}>
      <span className={styles.resourceLabel}>Hit points</span><span className={styles.resourceValue}>{hp?.current ?? '—'} <small>/ {hp?.max ?? '—'}</small></span>
      <span className={styles.resourceHint}>{hp?.temp ? `+${hp.temp} temporary · Manage` : 'Manage HP'}</span>
    </Button>
    <Button variant="ghost" className={`${styles.resourceButton} ${styles.threads}`} onClick={() => onAction('threads')}>
      <span className={styles.resourceLabel}>Threads</span><span className={styles.resourceValue}>{threads?.current ?? '—'} <small>/ {threads?.max ?? '—'}</small></span><span className={styles.resourceHint}>Manage Threads</span>
    </Button>
    <div className={styles.resourceStat}><span className={styles.resourceLabel}>Defense TN</span><strong className={styles.resourceValue}>{sheet.sheet.dtn ?? '—'}</strong><span className={styles.resourceHint}>Target to hit</span></div>
    <div className={styles.resourceStat}><span className={styles.resourceLabel}>Protection</span><strong className={styles.resourceValue}>{getProtection(sheet)}</strong><span className={styles.resourceHint}>Equipped armor</span></div>
    <Button variant="ghost" className={`${styles.resourceButton} ${styles.conditionResource}`} onClick={() => onNavigate('conditions')}>
      <span className={styles.resourceLabel}>Conditions</span><span className={styles.resourceValue}>{sheet.sheet.conditions?.length ?? 0}</span><span className={styles.resourceHint}>View & manage</span>
    </Button>
  </section>;
}

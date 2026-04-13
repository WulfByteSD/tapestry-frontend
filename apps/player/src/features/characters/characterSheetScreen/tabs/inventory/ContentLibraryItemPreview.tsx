'use client';

import Image from 'next/image';
import { Modal } from '@tapestry/ui';
import type { AttackProfile, ItemDefinition } from '@tapestry/types';
import styles from './ContentLibraryItemPreview.module.scss';

type Props = {
  item: ItemDefinition | null;
  onClose: () => void;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function row(label: string, value: React.ReactNode) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

function AttackProfileSection({ profiles }: { profiles: AttackProfile[] }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>Attack Profiles</h4>
      <div className={styles.profileList}>
        {profiles.map((p) => (
          <div key={p.key} className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <strong>{p.name}</strong>
              {p.attackKind && <span className={styles.kindBadge}>{p.attackKind}</span>}
            </div>
            <div className={styles.profileDetails}>
              {p.harm !== undefined && row('Harm', p.harm)}
              {p.modifier !== undefined && row('Modifier', p.modifier >= 0 ? `+${p.modifier}` : String(p.modifier))}
              {p.rangeLabel && row('Range', p.rangeLabel)}
              {p.defaultAspect && row('Aspect', p.defaultAspect)}
              {!!p.allowedSkillKeys?.length && row('Skills', p.allowedSkillKeys.join(', '))}
              {p.notes && row('Notes', p.notes)}
            </div>
            {!!p.tags?.length && (
              <div className={styles.tagRow}>
                {p.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function ContentLibraryItemPreview({ item, onClose }: Props) {
  if (!item) return null;

  const hasImage = !!item.imageUrl;
  const hasAttacks = !!item.attackProfiles?.length;
  const hasAbilities = !!item.grantedAbilities?.length;

  return (
    <Modal open={!!item} onCancel={onClose} footer={null} title={item.name} width={600} zIndex={1100} destroyOnClose>
      <div className={styles.root}>
        {/* Hero image */}
        {hasImage && (
          <div className={styles.hero}>
            <Image src={item.imageUrl!} alt={item.name} fill style={{ objectFit: 'contain' }} unoptimized />
          </div>
        )}

        {/* Badges */}
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{item.category}</span>
          {item.slot && <span className={styles.slotBadge}>{item.slot}</span>}
          {item.equippable && !item.slot && <span className={styles.slotBadge}>equippable</span>}
          {item.stackable && <span className={styles.traitBadge}>stackable</span>}
        </div>

        {/* Core stats */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Stats</h4>
          {(item.protection === undefined || item.protection === 0) && !hasAttacks ? (
            <p className={styles.none}>No stats defined.</p>
          ) : (
            <div className={styles.statGrid}>
              {typeof item.protection === 'number' && item.protection > 0 && (
                <div className={styles.statBlock}>
                  <span className={styles.statVal}>{item.protection}</span>
                  <span className={styles.statLbl}>Defense</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>
            <p className={styles.notes}>{item.notes}</p>
          </div>
        )}

        {/* Attack profiles */}
        {hasAttacks && <AttackProfileSection profiles={item.attackProfiles!} />}

        {/* Granted abilities */}
        {hasAbilities && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Granted Abilities</h4>
            <div className={styles.abilityList}>
              {item.grantedAbilities!.map((ab) => (
                <div key={ab.abilityKey} className={styles.abilityRow}>
                  <code className={styles.abilityKey}>{ab.abilityKey}</code>
                  <span className={styles.abilityMeta}>
                    {ab.grantMode ?? 'passive'}
                    {ab.requiresEquipped && ' · requires equipped'}
                  </span>
                  {ab.notes && <span className={styles.abilityNotes}>{ab.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {!!item.tags?.length && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Tags</h4>
            <div className={styles.tagRow}>
              {item.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

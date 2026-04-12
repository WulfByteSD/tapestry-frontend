'use client';

import Image from 'next/image';
import { Button } from '@tapestry/ui';
import type { InventoryItem } from '@tapestry/types';
import styles from './InventoryTab.module.scss';

// --- Display helpers (card-local) ---

function getDisplayName(item: InventoryItem): string {
  return item.overrides?.displayName || item.name || item.definition?.itemKey || 'Unnamed Item';
}

function getProtection(item: InventoryItem): number | null {
  if (item.overrides?.protection !== undefined && item.overrides.protection !== null) {
    return item.overrides.protection;
  }
  if (typeof item.protection === 'number') {
    return item.protection;
  }
  return null;
}

function getHarm(item: InventoryItem): number | string | null {
  if (item.overrides?.harm !== undefined && item.overrides.harm !== null) {
    return item.overrides.harm;
  }
  if (item.attackProfiles && item.attackProfiles.length > 0) {
    const profile = item.attackProfiles.find((p) => p.key === item.selectedAttackProfileKey) ?? item.attackProfiles[0];
    if (profile?.harm !== undefined && profile.harm !== null) {
      return profile.harm;
    }
  }
  return null;
}

// --- Component ---

type InventoryItemCardProps = {
  item: InventoryItem;
  variant?: 'card' | 'slot';
  onRemove: (instanceId?: string) => void;
  onToggleEquipped: (instanceId?: string) => void;
  onQuantityChange: (instanceId: string | undefined, qty: number) => void;
};

export function InventoryItemCard({ item, variant = 'card', onRemove, onToggleEquipped, onQuantityChange }: InventoryItemCardProps) {
  const protection = getProtection(item);
  const harm = getHarm(item);
  const hasSpecialProps = protection !== null || harm !== null;
  const displayName = getDisplayName(item);

  if (variant === 'slot') {
    return (
      <div className={styles.slotItemContent}>
        <span className={styles.slotItemName}>{displayName}</span>
        <Button variant="outline" onClick={() => onToggleEquipped(item.instanceId)}>
          Unequip
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemImageArea}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={displayName} fill style={{ objectFit: 'contain' }} unoptimized />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>{item.category === 'weapon' ? '⚔️' : item.category === 'armor' ? '🛡️' : '📦'}</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.itemTitle}>{displayName}</div>
          <div className={styles.badges}>
            {item.category ? <span className={styles.badge}>{item.category}</span> : null}
            {item.equipped ? <span className={styles.badgeActive}>Equipped</span> : null}
          </div>
        </div>

        {hasSpecialProps ? (
          <div className={styles.itemStats}>
            {protection !== null && (
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Protection</div>
                <div className={styles.statValue}>+{protection}</div>
              </div>
            )}
            {harm !== null && (
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Harm</div>
                <div className={styles.statValue}>{harm}</div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.divider} />
        )}

        <div className={styles.actions}>
          {item.stackable && (
            <label className={styles.qtyField}>
              <span>Qty</span>
              <input type="number" min={1} value={item.qty} onChange={(e) => onQuantityChange(item.instanceId, Number(e.target.value))} />
            </label>
          )}

          {(item.category === 'weapon' || item.slot) && (
            <Button variant={item.equipped ? 'outline' : 'solid'} onClick={() => onToggleEquipped(item.instanceId)}>
              {item.equipped ? 'Unequip' : 'Equip'}
            </Button>
          )}

          <Button variant="outline" onClick={() => onRemove(item.instanceId)}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

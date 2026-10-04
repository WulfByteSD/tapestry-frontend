'use client';

import Image from 'next/image';
import { getCategoryIconUrl } from './inventoryIcons';
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

function getSlotLabel(slot?: string): string | null {
  if (!slot) return null;
  const labels: Record<string, string> = {
    body: 'Torso', chest: 'Torso', torso: 'Torso', main_hand: 'Main hand', mainhand: 'Main hand',
    off_hand: 'Off hand', offhand: 'Off hand', two_hands: 'Two hands', twohands: 'Two hands',
  };
  return labels[slot.toLowerCase()] ?? slot.replaceAll('_', ' ');
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
  const displayName = getDisplayName(item);
  const slotLabel = getSlotLabel(item.slot);

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
    <article className={styles.itemCard} data-equipped={item.equipped}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeading}>
            <h4 className={styles.itemTitle}>{displayName}</h4>
            <div className={styles.itemMeta}>
              {item.category ?? 'Item'}{slotLabel ? ` · ${slotLabel}` : ''}
            </div>
          </div>
          <div className={styles.itemImageArea}>
            <Image src={item.imageUrl ?? getCategoryIconUrl(item.category)} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
          </div>
        </div>

        {(protection !== null || harm !== null) && (
          <dl className={styles.itemStats}>
            {protection !== null && (
              <div className={styles.statBox}>
                <dt className={styles.statLabel}>Protection</dt>
                <dd className={styles.statValue}>+{protection}</dd>
              </div>
            )}
            {harm !== null && (
              <div className={styles.statBox}>
                <dt className={styles.statLabel}>Harm</dt>
                <dd className={styles.statValue}>{harm}</dd>
              </div>
            )}
          </dl>
        )}

        <div className={styles.actions}>
          {item.stackable && (
            <label className={styles.qtyField}>
              <span>Qty</span>
              <input aria-label={`Quantity of ${displayName}`} type="number" min={1} step={1} value={item.qty} onChange={(e) => onQuantityChange(item.instanceId, Number(e.target.value))} />
            </label>
          )}

          {(item.category === 'weapon' || item.slot) && (
            <Button size="sm" variant="outline" onClick={() => onToggleEquipped(item.instanceId)}>
              {item.equipped ? 'Unequip' : 'Equip'}
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => onRemove(item.instanceId)}>
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

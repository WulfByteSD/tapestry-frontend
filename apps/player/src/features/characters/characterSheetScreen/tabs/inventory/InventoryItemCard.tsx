'use client';

import Image from 'next/image';
import { getCategoryIconUrl } from './inventoryIcons';
import { Button } from '@tapestry/ui';
import type { InventoryItem } from '@tapestry/types';
import styles from './InventoryTab.module.scss';

// --- Display helpers (card-local) ---

function getDisplayName(item: InventoryItem, readOnly: boolean): string {
  const name = item.overrides?.displayName || item.name;
  if (name) return name;
  if (!readOnly) return item.definition?.itemKey || 'Unnamed Item';
  const key = item.definition?.itemKey || item.itemKey;
  return key ? (key.split(':').pop() ?? key).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unnamed Item';
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
} & ({
  readOnly: true;
} | {
  readOnly?: false;
  onRemove: (instanceId?: string) => void;
  onToggleEquipped: (instanceId?: string) => void;
  onQuantityChange: (instanceId: string | undefined, qty: number) => void;
});

export function InventoryItemCard(props: InventoryItemCardProps) {
  const { item, variant = 'card' } = props;
  const readOnly = props.readOnly === true;
  const protection = getProtection(item);
  const harm = getHarm(item);
  const displayName = getDisplayName(item, readOnly);
  const slotLabel = getSlotLabel(item.slot);
  const tags = item.overrides?.tags ?? item.tags;

  if (variant === 'slot') {
    return (
      <div className={styles.slotItemContent}>
        <span className={styles.slotItemName}>{displayName}</span>
        {!props.readOnly && <Button variant="outline" onClick={() => props.onToggleEquipped(item.instanceId)}>
          Unequip
        </Button>}
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

        {(readOnly || protection !== null || harm !== null) && (
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
            {readOnly && (
              <div className={styles.statBox}>
                <dt className={styles.statLabel}>Qty</dt>
                <dd className={styles.statValue}>{item.qty}</dd>
              </div>
            )}
          </dl>
        )}

        {readOnly && (!!item.attackProfiles?.length || item.notes || !!tags?.length) && (
          <div className={styles.itemDetails}>
            {!!item.attackProfiles?.length && <ul className={styles.attackProfiles}>{item.attackProfiles.map((attack) => (
              <li key={attack.key}>
                <strong>{attack.name}</strong>
                {attack.harm != null && <> · Harm {attack.harm}</>}
                {attack.modifier != null && <> · Modifier {Number.isFinite(attack.modifier) ? (attack.modifier > 0 ? `+${attack.modifier}` : attack.modifier) : '—'}</>}
                {attack.rangeLabel && <> · {attack.rangeLabel}</>}
                {attack.notes && <p className={styles.itemNotes}>{attack.notes}</p>}
              </li>
            ))}</ul>}
            {item.notes && <p className={styles.itemNotes}>{item.notes}</p>}
            {!!tags?.length && <p className={styles.itemTags}>Tags: {tags.join(', ')}</p>}
          </div>
        )}

        {!props.readOnly && <div className={styles.actions}>
          {item.stackable && (
            <label className={styles.qtyField}>
              <span>Qty</span>
              <input aria-label={`Quantity of ${displayName}`} type="number" min={1} step={1} value={item.qty} onChange={(e) => props.onQuantityChange(item.instanceId, Number(e.target.value))} />
            </label>
          )}

          {(item.category === 'weapon' || item.slot) && (
            <Button size="sm" variant="outline" onClick={() => props.onToggleEquipped(item.instanceId)}>
              {item.equipped ? 'Unequip' : 'Equip'}
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => props.onRemove(item.instanceId)}>
            Remove
          </Button>
        </div>}
      </div>
    </article>
  );
}

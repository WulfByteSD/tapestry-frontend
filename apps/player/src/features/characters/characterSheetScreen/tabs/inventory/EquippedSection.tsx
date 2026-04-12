'use client';

import type { InventoryItem } from '@tapestry/types';
import { InventoryItemCard } from './InventoryItemCard';
import styles from './InventoryTab.module.scss';

// Duplicated locally from admin editor.constants for Phase 1.
// Promote to packages/types or packages/rules in a later phase.
const INVENTORY_SLOTS: { key: string; label: string }[] = [
  { key: 'head', label: 'Head' },
  { key: 'body', label: 'Body' },
  { key: 'legs', label: 'Legs' },
  { key: 'feet', label: 'Feet' },
  { key: 'hands', label: 'Hands' },
  { key: 'weapon', label: 'Weapon' },
  { key: 'shield', label: 'Shield' },
  { key: 'accessory', label: 'Accessory' },
  { key: 'consumable', label: 'Consumable' },
  { key: 'other', label: 'Other' },
];

function resolveSlotKey(item: InventoryItem): string {
  if (item.slot) return item.slot;
  if (item.category === 'weapon') return 'weapon';
  return 'other';
}

type Props = {
  equippedItems: InventoryItem[];
  onToggleEquipped: (instanceId?: string) => void;
  onRemove: (instanceId?: string) => void;
};

export function EquippedSection({ equippedItems, onToggleEquipped, onRemove }: Props) {
  const bySlot = new Map<string, InventoryItem>();
  equippedItems.forEach((item) => {
    const key = resolveSlotKey(item);
    if (!bySlot.has(key)) {
      bySlot.set(key, item);
    }
  });

  return (
    <div className={styles.equippedSection}>
      <div className={styles.slotGrid}>
        {INVENTORY_SLOTS.map(({ key, label }) => {
          const item = bySlot.get(key);
          return (
            <div key={key} className={item ? styles.slotTile : styles.slotTileEmpty}>
              <div className={styles.slotLabel}>{label}</div>
              {item ? (
                <InventoryItemCard item={item} variant="slot" onToggleEquipped={onToggleEquipped} onRemove={onRemove} onQuantityChange={() => {}} />
              ) : (
                <div className={styles.slotEmpty}>—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

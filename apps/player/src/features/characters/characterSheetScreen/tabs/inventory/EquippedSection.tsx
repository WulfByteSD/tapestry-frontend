'use client';

import { useMemo, useState } from 'react';
import type { InventoryItem } from '@tapestry/types';
import { InventoryItemCard } from './InventoryItemCard';
import { MaleBodySilhouette, FemaleBodySilhouette, type BodySlotKey } from '@tapestry/ui';
import styles from './InventoryTab.module.scss';

type OverflowSlotKey = 'consumable' | 'other';
type SlotKey = BodySlotKey | OverflowSlotKey;

export const BODY_SLOT_ORDER: BodySlotKey[] = ['head', 'body', 'hands', 'legs', 'feet', 'weapon', 'shield', 'accessory'];

const SLOT_LABELS: Record<BodySlotKey, string> = {
  head: 'Head',
  body: 'Torso',
  hands: 'Hands',
  legs: 'Legs',
  feet: 'Feet',
  weapon: 'Weapon',
  shield: 'Shield',
  accessory: 'Accessory',
};

export function resolveSlotKey(item: InventoryItem): SlotKey {
  const rawSlot = item.slot?.toLowerCase();

  switch (rawSlot) {
    case 'head':
      return 'head';
    case 'body':
    case 'chest':
    case 'torso':
      return 'body';
    case 'hands':
    case 'gloves':
      return 'hands';
    case 'legs':
      return 'legs';
    case 'feet':
    case 'boots':
      return 'feet';
    case 'weapon':
    case 'main_hand':
    case 'mainhand':
    case 'two_hands':
    case 'twohands':
      return 'weapon';
    case 'shield':
    case 'off_hand':
    case 'offhand':
      return 'shield';
    case 'accessory':
    case 'neck':
    case 'ring':
    case 'back':
      return 'accessory';
    case 'consumable':
      return 'consumable';
    case 'other':
      return 'other';
    default:
      break;
  }

  if (item.category === 'weapon') return 'weapon';
  return 'other';
}

type Props = {
  equippedItems: InventoryItem[];
  onToggleEquipped: (instanceId?: string) => void;
  onRemove: (instanceId?: string) => void;
  onQuantityChange: (instanceId: string | undefined, qty: number) => void;
  characterSex?: string;
};

export function EquippedSection({ equippedItems, onToggleEquipped, onRemove, onQuantityChange, characterSex }: Props) {
  const BodySilhouette = characterSex?.toLowerCase() === 'female' ? FemaleBodySilhouette : MaleBodySilhouette;
  const bySlot = useMemo(() => {
    const map = new Map<SlotKey, InventoryItem[]>();

    for (const item of equippedItems) {
      const key = resolveSlotKey(item);
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, item]);
    }

    return map;
  }, [equippedItems]);

  const [selectedSlot, setSelectedSlot] = useState<BodySlotKey | null>(null);

  const activeItems = selectedSlot === null ? equippedItems : (bySlot.get(selectedSlot) ?? []);
  const activeLabel = selectedSlot === null ? 'All equipped' : SLOT_LABELS[selectedSlot];

  const slotStates = Object.fromEntries(BODY_SLOT_ORDER.map((key) => [key, key === selectedSlot ? 'active' : bySlot.has(key) ? 'filled' : 'empty'])) as Record<
    BodySlotKey,
    'empty' | 'filled' | 'active'
  >;

  return (
    <div className={styles.equippedSection}>
      <div className={styles.equippedLayout}>
        <div className={styles.diagramPanel}>
          <div className={styles.diagramHeader}>
            <div>
              <div className={styles.diagramTitle}>Equipment</div>
              <div className={styles.diagramSubtle}>Select a zone to see its items.</div>
            </div>
          </div>

          <BodySilhouette slotStates={slotStates} onSlotClick={setSelectedSlot} className={styles.equipmentSvg} />

          <div className={styles.zoneControls} role="group" aria-label="Equipment zones">
            {BODY_SLOT_ORDER.map((slot) => {
              const count = bySlot.get(slot)?.length ?? 0;
              return (
                <button
                  key={slot}
                  type="button"
                  className={styles.zoneControl}
                  aria-label={`${SLOT_LABELS[slot]}, ${count} equipped ${count === 1 ? 'item' : 'items'}`}
                  aria-pressed={selectedSlot === slot}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <span>{SLOT_LABELS[slot]}</span>
                  <span className={styles.sectionCount} aria-hidden="true">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.equippedInspector}>
          <div className={styles.inspectorHeader}>
            <span className={styles.inspectorSlotLabel}>{activeLabel}</span>
            <span className={styles.sectionCount}>{activeItems.length}</span>
            <button type="button" className={styles.showAll} aria-pressed={selectedSlot === null} onClick={() => setSelectedSlot(null)}>
              All
            </button>
          </div>

          {activeItems.length > 0 ? (
            <div className={styles.inspectorList}>
              {activeItems.map((item) => (
                <InventoryItemCard key={item.instanceId} item={item} onToggleEquipped={onToggleEquipped} onRemove={onRemove} onQuantityChange={onQuantityChange} />
              ))}
            </div>
          ) : (
            <div className={styles.inspectorEmpty}>{selectedSlot === null ? 'Nothing equipped yet.' : 'Nothing equipped here.'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

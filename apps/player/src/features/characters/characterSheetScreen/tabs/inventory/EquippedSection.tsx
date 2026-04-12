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
  body: 'Body',
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
  characterSex?: string;
};

export function EquippedSection({ equippedItems, onToggleEquipped, onRemove, characterSex }: Props) {
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

  const defaultSlot = BODY_SLOT_ORDER.find((slotKey) => bySlot.has(slotKey)) ?? 'body';
  const [selectedSlot, setSelectedSlot] = useState<BodySlotKey>(defaultSlot);

  const activeItems = bySlot.get(selectedSlot) ?? [];
  const activeLabel = SLOT_LABELS[selectedSlot];

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
              <div className={styles.diagramTitle}>Equipment Map</div>
              <div className={styles.diagramSubtle}>Click a zone to inspect what is equipped there.</div>
            </div>
          </div>

          <BodySilhouette slotStates={slotStates} onSlotClick={setSelectedSlot} className={styles.equipmentSvg} />
        </div>

        <div className={styles.equippedInspector}>
          <div className={styles.inspectorHeader}>
            <span className={styles.inspectorSlotLabel}>{activeLabel}</span>
          </div>

          {activeItems.length > 0 ? (
            <div className={styles.inspectorList}>
              {activeItems.map((item) => (
                <InventoryItemCard key={item.instanceId} item={item} onToggleEquipped={onToggleEquipped} onRemove={onRemove} onQuantityChange={() => {}} />
              ))}
            </div>
          ) : (
            <div className={styles.inspectorEmpty}>Nothing is equipped in the {activeLabel.toLowerCase()} slot.</div>
          )}
        </div>
      </div>
    </div>
  );
}

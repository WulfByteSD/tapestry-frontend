'use client';

import { useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader } from '@tapestry/ui';
import type { CharacterSheet, ItemDefinition } from '@tapestry/types';
import { useUpdateCharacterSheetMutation } from '../../characterSheet.mutations';
import { addInventoryItemFromDefinition, removeInventoryItem, toggleInventoryEquipped, updateInventoryQuantity } from './inventory.functions';
import styles from './InventoryTab.module.scss';
import { ContentLibraryModal } from './ContentLibrary.modal';
import { InventoryItemCard } from './InventoryItemCard';
import { EquippedSection, resolveSlotKey } from './EquippedSection';

type Props = {
  sheet: CharacterSheet;
  mode: 'build' | 'play';
};

export function InventoryTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const inventory = sheet?.sheet?.inventory ?? [];

  const { stats, equippedItems, backpackItems, overflowItems } = useMemo(() => {
    const equipped = inventory.filter((item) => item.equipped);
    const backpack = inventory.filter((item) => !item.equipped);

    const overflow = equipped.filter((item) => {
      const key = resolveSlotKey(item);
      return key === 'consumable' || key === 'other';
    });

    return {
      equippedItems: equipped,
      backpackItems: backpack,
      overflowItems: overflow,
      stats: {
        total: inventory.length,
        equipped: equipped.length,
        weapons: inventory.filter((item) => item.category === 'weapon').length,
      },
    };
  }, [inventory]);

  function persistInventory(nextInventory: typeof inventory, settingKey?: string) {
    const payload: Record<string, unknown> = {
      'sheet.inventory': nextInventory,
    };

    if (!sheet.settingKey && settingKey) {
      payload.settingKey = settingKey;
    }

    update.mutate(payload);
  }

  function handleAddItem(item: ItemDefinition, settingKey: string) {
    const nextInventory = addInventoryItemFromDefinition(inventory, { ...item, activeSettingKey: settingKey });
    persistInventory(nextInventory, settingKey);
  }

  function handleRemove(instanceId?: string) {
    persistInventory(removeInventoryItem(inventory, instanceId));
  }

  function handleToggleEquipped(instanceId?: string) {
    persistInventory(toggleInventoryEquipped(inventory, instanceId));
  }

  function handleQuantityChange(instanceId: string | undefined, qty: number) {
    persistInventory(updateInventoryQuantity(inventory, instanceId, qty));
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className={styles.headerRow}>
            <div>
              <h3 className={styles.title}>Inventory</h3>
              <p className={styles.subtle}>Manage what the character carries and equips.</p>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.stats}>
                <span>{stats.total} items</span>
                <span>{stats.equipped} equipped</span>
                <span>{stats.weapons} weapons</span>
              </div>

              <Button onClick={() => setLibraryOpen(true)}>Add</Button>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {inventory.length === 0 ? (
            <div className={styles.empty}>
              Nothing in inventory yet. Click <strong>Add</strong> to open the content library.
            </div>
          ) : (
            <div className={styles.sections}>
              {equippedItems.length > 0 && (
                <div>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionLabel}>Equipped</span>
                    <span className={styles.sectionCount}>{equippedItems.length}</span>
                  </div>
                  <EquippedSection equippedItems={equippedItems} onToggleEquipped={handleToggleEquipped} onRemove={handleRemove} />
                </div>
              )}

              {overflowItems.length > 0 && (
                <div>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionLabel}>Additional Equipped Items</span>
                    <span className={styles.sectionCount}>{overflowItems.length}</span>
                  </div>
                  <div className={styles.list}>
                    {overflowItems.map((item) => (
                      <InventoryItemCard
                        key={item.instanceId}
                        item={item}
                        onRemove={handleRemove}
                        onToggleEquipped={handleToggleEquipped}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionLabel}>Backpack</span>
                  <span className={styles.sectionCount}>{backpackItems.length}</span>
                </div>
                {backpackItems.length === 0 ? (
                  <div className={styles.sectionEmpty}>All items are currently equipped.</div>
                ) : (
                  <div className={styles.list}>
                    {backpackItems.map((item) => (
                      <InventoryItemCard
                        key={item.instanceId}
                        item={item}
                        onRemove={handleRemove}
                        onToggleEquipped={handleToggleEquipped}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <ContentLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} sheet={sheet} onAddItem={handleAddItem} />
    </>
  );
}

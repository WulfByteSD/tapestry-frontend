"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import type { CharacterSheet, ItemDefinition } from "@tapestry/types";
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import {
  addInventoryItemFromDefinition,
  getInventoryDisplayName,
  getInventoryProtection,
  getInventoryHarm,
  removeInventoryItem,
  toggleInventoryEquipped,
  updateInventoryQuantity,
} from "./inventory.functions";
import styles from "./InventoryTab.module.scss";
import { ContentLibraryModal } from "./ContentLibrary.modal";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

export function InventoryTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const inventory = sheet?.sheet?.inventory ?? [];

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      equipped: inventory.filter((item) => item.equipped).length,
      weapons: inventory.filter((item) => item.category === "weapon").length,
    };
  }, [inventory]);

  function persistInventory(nextInventory: typeof inventory, settingKey?: string) {
    const payload: Record<string, unknown> = {
      "sheet.inventory": nextInventory,
    };

    if (!sheet.settingKey && settingKey) {
      payload.settingKey = settingKey;
    }

    update.mutate(payload);
  }

  function handleAddItem(item: ItemDefinition, settingKey: string) {
    const nextInventory = addInventoryItemFromDefinition(inventory, item);
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
            <div className={styles.list}>
              {inventory.map((item) => {
                const protection = getInventoryProtection(item);
                const harm = getInventoryHarm(item);
                const hasSpecialProps = protection !== null || harm !== null;

                return (
                  <div key={item.instanceId} className={styles.itemCard}>
                    <div className={styles.itemImageArea}>
                      {/* Future: item.imageUrl will go here */}
                      <div className={styles.imagePlaceholder}>
                        <span className={styles.placeholderIcon}>
                          {item.category === "weapon" ? "⚔️" : item.category === "armor" ? "🛡️" : "📦"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <div className={styles.itemTitle}>{getInventoryDisplayName(item)}</div>
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

                      {/* <div className={styles.itemKey}>{item.itemKey || item.definition?.itemKey || "custom-item"}</div> */}

                      <div className={styles.actions}>
                        {item.stackable && (
                          <label className={styles.qtyField}>
                            <span>Qty</span>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => handleQuantityChange(item.instanceId, Number(e.target.value))}
                            />
                          </label>
                        )}

                        {(item.category === "weapon" || item.slot) && (
                          <Button variant={item.equipped ? "outline" : "solid"} onClick={() => handleToggleEquipped(item.instanceId)}>
                            {item.equipped ? "Unequip" : "Equip"}
                          </Button>
                        )}

                        <Button variant="outline" onClick={() => handleRemove(item.instanceId)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <ContentLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        sheet={sheet}
        onAddItem={handleAddItem}
      />
    </>
  );
}

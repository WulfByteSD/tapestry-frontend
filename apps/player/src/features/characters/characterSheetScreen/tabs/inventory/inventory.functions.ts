import type { InventoryItem, ItemDefinition } from "@tapestry/types";

export function makeInventoryInstanceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getInventoryDisplayName(item: InventoryItem) {
  return item.overrides?.displayName || item.name || item.definition?.itemKey || "Unnamed Item";
}

export function mapItemDefinitionToInventoryItem(item: ItemDefinition): InventoryItem {
  return {
    instanceId: makeInventoryInstanceId(),
    definition: {
      itemKey: item.key,
      sourceId: item._id,
      settingKey: item.settingKey,
    },
    itemKey: item.key,
    sourceId: item._id,
    name: item.name,
    qty: 1,
    tags: item.tags ?? [],
    notes: item.notes ?? "",
    category: item.category,
    stackable: item.stackable ?? false,
    equipped: false,
    slot: item.slot ?? undefined,
    attackProfiles: item.attackProfiles ?? [],
    selectedAttackProfileKey: item.attackProfiles?.[0]?.key,
  };
}

export function addInventoryItemFromDefinition(inventory: InventoryItem[], item: ItemDefinition): InventoryItem[] {
  if (item.stackable) {
    const existing = inventory.find((entry) => entry.itemKey === item.key && !entry.equipped);

    if (existing?.instanceId) {
      return inventory.map((entry) =>
        entry.instanceId === existing.instanceId ? { ...entry, qty: Math.max(1, (entry.qty || 1) + 1) } : entry,
      );
    }
  }

  return [...inventory, mapItemDefinitionToInventoryItem(item)];
}

export function removeInventoryItem(inventory: InventoryItem[], instanceId?: string): InventoryItem[] {
  if (!instanceId) return inventory;
  return inventory.filter((item) => item.instanceId !== instanceId);
}

export function toggleInventoryEquipped(inventory: InventoryItem[], instanceId?: string): InventoryItem[] {
  if (!instanceId) return inventory;

  return inventory.map((item) => (item.instanceId === instanceId ? { ...item, equipped: !item.equipped } : item));
}
export function updateInventoryQuantity(
  inventory: InventoryItem[],
  instanceId: string | undefined,
  qty: number,
): InventoryItem[] {
  if (!instanceId) return inventory;

  return inventory.map((item) => {
    if (item.instanceId !== instanceId) return item;
    if (!item.stackable) return { ...item, qty: 1 };

    const safeQty = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
    return { ...item, qty: safeQty };
  });
}

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

export function getInventoryProtection(item: InventoryItem): number | null {
  // Check overrides first
  if (item.overrides?.protection !== undefined && item.overrides.protection !== null) {
    return item.overrides.protection;
  }
  // Return protection only if it's a valid number (not null or undefined)
  if (typeof item.protection === "number") {
    return item.protection;
  }
  return null;
}

export function getInventoryHarm(item: InventoryItem): number | string | null {
  // Check overrides first
  if (item.overrides?.harm !== undefined && item.overrides.harm !== null) {
    return item.overrides.harm;
  }

  // Check attack profiles
  if (item.attackProfiles && item.attackProfiles.length > 0) {
    // Use selected profile if available, otherwise use first profile
    const profile = item.attackProfiles.find((p) => p.key === item.selectedAttackProfileKey) ?? item.attackProfiles[0];
    if (profile?.harm !== undefined && profile.harm !== null) {
      return profile.harm;
    }
  }

  return null;
}

export function mapItemDefinitionToInventoryItem(item: ItemDefinition): InventoryItem {
  return {
    instanceId: makeInventoryInstanceId(),
    definition: {
      itemKey: item.key,
      sourceId: item._id,
      settingKey: item.activeSettingKey,
    },
    protection: item.protection,
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
    grantedAbilities: item.grantedAbilities ?? [],
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

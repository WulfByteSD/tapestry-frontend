import { ASPECT_BLOCKS, type AspectGroup, type AspectKey, type InventoryItem } from "@tapestry/types";

export function titleCaseFromId(id: string) {
  const raw = id.includes(":") ? id.split(":").pop()! : id;
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

export function normalizeSkills(skills: any): Record<string, number> {
  if (!skills) return {};

  if (typeof skills === "object" && !Array.isArray(skills)) {
    return skills as Record<string, number>;
  }

  if (Array.isArray(skills)) {
    const out: Record<string, number> = {};
    for (const entry of skills) {
      if (Array.isArray(entry) && entry.length >= 2) {
        out[String(entry[0])] = Number(entry[1]);
      }
    }
    return out;
  }

  return {};
}

export function getEquippedWeapons(sheet: any): InventoryItem[] {
  const inventory = sheet?.sheet?.inventory ?? [];
  return inventory.filter((item: InventoryItem) => item?.equipped && item?.category === "weapon");
}

export function parseAspectPath(value?: string | null): { group: AspectGroup; key: AspectKey } | null {
  if (!value || !value.includes(".")) return null;

  const [group, key] = value.split(".");
  const valid = ASPECT_BLOCKS.some((block) => block.group === group && block.keys.some((entry) => entry.key === key));

  if (!valid) return null;

  return {
    group: group as AspectGroup,
    key: key as AspectKey,
  };
}

export function getDefaultAttackAspect(weapon?: InventoryItem | null, attackProfileKey?: string | null): string {
  const profile = weapon?.attackProfiles?.find((p) => p.key === attackProfileKey) ?? weapon?.attackProfiles?.[0];

  return profile?.defaultAspect || "might.strength";
}

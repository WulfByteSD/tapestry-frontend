import { harmBands } from './Combatant.choices';
import type { HarmBand } from './CombatantHarm.types';

export function parseHarm(value: string) {
  const match = /^(Light|Standard|Heavy|Brutal) \((.*)\)$/.exec(value);
  if (!match) return null;
  const band = match[1] as HarmBand;
  const amount = match[2];
  return { band, amount };
}

export function validHarm(value: string) {
  if (!value.trim()) return false;
  const parsed = parseHarm(value);
  // Preserve legacy notation until the author explicitly replaces it.
  if (!parsed) return true;
  const [min, max] = harmBands[parsed.band];
  const amount = Number(parsed.amount);
  return /^\d+$/.test(parsed.amount) && Number.isSafeInteger(amount) && amount >= min && amount <= max;
}

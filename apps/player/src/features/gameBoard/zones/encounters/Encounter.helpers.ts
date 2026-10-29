import { isAxiosError } from 'axios';
import type { EncounterCombatantSnapshot } from '@tapestry/types';
import type { CombatantFormValue } from './Encounter.types';
import { tierOptions } from './Combatant.choices';
import { validHarm } from './CombatantHarm.helpers';

export const emptyCombatant = (): CombatantFormValue => ({
  name: '', category: 'unwoven', disposition: 'hostile', tier: '', origin: '', role: '',
  statline: { hp: '', defenseTN: '', harm: '', armor: 0, move: '', actions: 1, tags: [] },
  attacks: [], abilities: [], notes: { gm: '', public: '' }, media: { portraitUrl: '' },
});
export function combatantIssue(value: CombatantFormValue): string | null {
  if (!value.name.trim()) return 'Enter a combatant name.';
  if (!tierOptions.some(option => option.value === value.tier)) return 'Choose a tier from 1 — Fragile to 5 — Mythic.';
  for (const [key, label, min] of [['hp', 'HP', 1], ['defenseTN', 'Defense TN', 1], ['armor', 'Armor', 0], ['actions', 'Actions', 1]] as const) {
    const number = value.statline[key];
    if (number === '' || !Number.isInteger(number) || number < min || number > 1000000) return `${label} must be a whole number from ${min} to 1,000,000.`;
  }
  if (!validHarm(value.statline.harm)) return 'Choose a Harm band and a fixed amount within that band.';
  if (value.attacks?.some(attack => !attack.name.trim() || !validHarm(attack.harm))) return 'Each attack needs a name and valid Harm.';
  if (value.abilities?.some(ability => !ability.name.trim() || !ability.text.trim())) return 'Each ability needs a name and effect.';
  if (value.media?.portraitUrl && !/^https?:\/\//i.test(value.media.portraitUrl)) return 'Use an HTTP or HTTPS portrait URL.';
  return null;
}
export function snapshotFromForm(value: CombatantFormValue): EncounterCombatantSnapshot {
  return { ...value, name: value.name.trim(), statline: { ...value.statline, hp: Number(value.statline.hp), defenseTN: Number(value.statline.defenseTN), armor: Number(value.statline.armor), actions: Number(value.statline.actions) } };
}
export function encounterError(error: unknown): string {
  return isAxiosError(error) && typeof error.response?.data?.message === 'string' ? error.response.data.message : 'The request could not be completed. Your changes are still here. Please try again.';
}
export function isConflict(error: unknown): boolean { return isAxiosError(error) && error.response?.status === 409; }
export function combatantSummary(snapshot: EncounterCombatantSnapshot): string {
  const stats = snapshot.statline;
  return `HP ${stats.hp} · Defense TN ${stats.defenseTN} · Harm ${stats.harm} · Armor ${stats.armor} · Actions ${stats.actions}${stats.move ? ` · Move ${stats.move}` : ''}`;
}

export function restoreAddFocus(button: HTMLButtonElement) {
  requestAnimationFrame(() => {
    // Native disabled controls can lose focus during the request. Respect focus
    // moved deliberately to another control or the combatant preview.
    if (document.activeElement === document.body && button.isConnected && !button.disabled) button.focus({ preventScroll: true });
  });
}

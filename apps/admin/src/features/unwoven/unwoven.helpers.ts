import type { Combatant, CombatantDraft, Issue } from './unwoven.types';

export const areas = [{ key: 'identity', label: 'Identity' }, { key: 'battle', label: 'Battle stats' }, { key: 'moves', label: 'Attacks & abilities' }, { key: 'lore', label: 'Lore & media' }, { key: 'review', label: 'Review' }] as const;
export function emptyDraft(): CombatantDraft {
  return { key: '', name: '', settingKeys: [], category: 'unwoven', disposition: 'hostile', status: 'draft', sourceType: 'original', loreNodeId: null,
    tier: '', origin: '', origins: [], role: '', perks: [], statline: { hp: '', defenseTN: '', harm: '', armor: 0, move: '', actions: 1, tags: [] }, attacks: [], abilities: [],
    loreCheck: { skill: 'Wit [Knowledge]', tn: 10, villagers: [], priests: [], scholars: [], soldiers: [] }, backgroundBehavior: '', whereFound: [], tactics: [], hooks: [],
    notes: { public: '', gm: '' }, media: { portraitUrl: '', tokenUrl: '', bannerUrl: '' } };
}
export function toDraft(record: Combatant): CombatantDraft {
  const defaults = emptyDraft();
  // Explicit allowlist keeps database metadata out of subsequent writes.
  const draft = Object.fromEntries(Object.keys(defaults).map(key => [key, ['statline', 'loreCheck', 'notes', 'media'].includes(key)
    ? { ...defaults[key as keyof CombatantDraft] as object, ...record[key as keyof Combatant] as object }
    : record[key as keyof Combatant] ?? defaults[key as keyof CombatantDraft]])) as CombatantDraft;
  if (!record.origins || record.origins.join(' / ') !== record.origin) draft.origins = record.origin ? [record.origin] : [];
  return draft;
}
export function payload(draft: CombatantDraft): CombatantDraft {
  const clean = (value: unknown): unknown => typeof value === 'string' ? value.trim() : Array.isArray(value) ? value.map(clean).filter(v => v !== '')
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v)])) : value;
  const result = { ...clean(draft) as CombatantDraft, key: draft.key.trim().toLowerCase(), loreNodeId: draft.loreNodeId?.trim() || null };
  result.statline.harm ||= result.attacks[0]?.harm || '';
  return result;
}
export const fingerprint = (draft: CombatantDraft) => JSON.stringify(draft);
export const numeric = (value: string): number | '' => value === '' ? '' : Number(value);
export const lines = (value: string) => value.split('\n');
export function validate(draft: CombatantDraft): Issue[] {
  const issues: Issue[] = [];
  const required = (value: string, field: string, message: string, area: Issue['area']) => { if (!value.trim()) issues.push({ area, field, message }); };
  required(draft.name, 'name', 'Give this Unwoven a name.', 'identity'); required(draft.key, 'key', 'Add a stable catalog key.', 'identity');
  for (const [field, label, min] of [['hp', 'HP', 1], ['defenseTN', 'Defense TN', 1], ['armor', 'Armor', 0], ['actions', 'Actions', 1]] as const) {
    const value = draft.statline[field];
    if (value === '' || !Number.isFinite(value) || value < min) issues.push({ area: 'battle', field, message: `${label} must be a number of at least ${min}.` });
  }
  required(draft.statline.harm || draft.attacks[0]?.harm || '', 'harm', 'Add an attack with harm, or set the advanced stat-block summary.', 'moves');
  for (const [field, value] of [['harm', draft.statline.harm], ...draft.attacks.map((attack, i) => [`attack-${i}-harm`, attack.harm])]) {
    const match = /^(Light|Standard|Heavy|Brutal) \((.*?)\)$/.exec(value);
    if (match) { const bounds: Record<string, [number, number]> = { Light: [2,4], Standard: [4,6], Heavy: [7,9], Brutal: [10,Infinity] }; const amount = Number(match[2]); const [min,max] = bounds[match[1]]; if (!match[2] || !Number.isInteger(amount) || amount < min || amount > max) issues.push({ area: 'moves', field, message: 'Choose fixed harm within the selected band.' }); }
  }
  draft.attacks.forEach((a, i) => { required(a.name, `attack-${i}-name`, `Attack ${i + 1} needs a name.`, 'moves'); required(a.harm, `attack-${i}-harm`, `Attack ${i + 1} needs harm.`, 'moves'); });
  draft.abilities.forEach((a, i) => { required(a.name, `ability-${i}-name`, `Ability ${i + 1} needs a name.`, 'moves'); required(a.text, `ability-${i}-text`, `Ability ${i + 1} needs its effect.`, 'moves'); });
  const prose: [string, string, Issue['area']][] = [
    ['backgroundBehavior', draft.backgroundBehavior, 'lore'], ['public-notes', draft.notes.public, 'lore'], ['gm-notes', draft.notes.gm, 'lore'],
    ...draft.attacks.map((attack, i): [string, string, Issue['area']] => [`attack-${i}-notes`, attack.notes, 'moves']),
    ...draft.abilities.map((ability, i): [string, string, Issue['area']] => [`ability-${i}-text`, ability.text, 'moves']),
  ];
  for (const [field, value, area] of prose) if (value.length > 100000) issues.push({ area, field, message: 'Shorten this prose field to at most 100,000 stored characters.' });
  if (draft.loreCheck.tn === '' || !Number.isFinite(draft.loreCheck.tn)) issues.push({ area: 'lore', field: 'lore-tn', message: 'Lore TN must be a number.' });
  if (draft.loreNodeId && !/^[a-f\d]{24}$/i.test(draft.loreNodeId.trim())) issues.push({ area: 'lore', field: 'loreNodeId', message: 'Use a 24-character lore node ID, or leave it blank.' });
  Object.entries(draft.media).forEach(([field, value]) => {
    if (!value.trim()) return;
    try { if (!['http:', 'https:'].includes(new URL(value).protocol)) throw Error(); }
    catch { issues.push({ area: 'lore', field, message: 'Use a complete http or https image URL.' }); }
  });
  return issues;
}
export function errorMessage(error: unknown): string {
  const response = (error as { response?: { status?: number; data?: { message?: string; error?: string } } })?.response;
  if (response?.status === 404) return 'This Unwoven no longer exists. Return to the catalog.';
  if (response?.status === 401 || response?.status === 403) return 'Your session cannot make this change. Sign in with an administrator account.';
  return response?.data?.message || response?.data?.error || 'The request could not be confirmed. Your edits are still here.';
}
export function uncertainWrite(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return !status || status >= 500;
}

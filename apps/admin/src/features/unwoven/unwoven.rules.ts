// Rules and Rulings Guide, PDF pp. 15–16/38 (Harm), p. 21 (arcs/Tiers).
// The Unwoven – Adversary System, PDF pp. 7 and 15 (Tier/Origin guidance).
export const tierOptions = ['Fragile', 'Competent', 'Heroic', 'Legendary', 'Mythic'].map((label, i) => ({ value: ['I', 'II', 'III', 'IV', 'V'][i], label: `${i + 1} — ${label}` }));
export const originSuggestions = ['Bestiary', 'Legionary', 'Construct', 'Aberration', 'Revenant', 'Entity'];
export const harmBands = { Light: [2, 4], Standard: [4, 6], Heavy: [7, 9], Brutal: [10, Infinity] } as const;
export type HarmBand = keyof typeof harmBands;
export function parseHarm(value: string): { band: HarmBand; amount: number } | null {
  const match = /^(Light|Standard|Heavy|Brutal) \((\d+)\)$/.exec(value);
  if (!match) return null;
  const band = match[1] as HarmBand,
    amount = Number(match[2]),
    [min, max] = harmBands[band];
  return amount >= min && amount <= max ? { band, amount } : null;
}

/** New tags trim outer whitespace and deduplicate case-insensitively; saved spellings stay intact. */
export function addOrigin(values: string[], input: string): string[] {
  const value = input.trim();
  return !value || values.some((existing) => existing.trim().toLowerCase() === value.toLowerCase()) ? values : [...values, value];
}
export function originChoices(selected: string[], catalog: string[]): string[] {
  return [...originSuggestions, ...catalog].reduce<string[]>((values, value) => addOrigin(values, value), [...new Set(selected)]);
}

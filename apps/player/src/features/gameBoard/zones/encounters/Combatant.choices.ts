// Mirrors admin unwoven.rules.ts: Rules & Rulings pp. 15–16/38, 21;
// The Unwoven — Adversary System pp. 7, 15. Values stay local to this feature.
export const tierOptions = ['Fragile', 'Competent', 'Heroic', 'Legendary', 'Mythic'].map((label, index) => ({ value: ['I', 'II', 'III', 'IV', 'V'][index], label: `${index + 1} — ${label}` }));
export const originOptions = ['Bestiary', 'Legionary', 'Construct', 'Aberration', 'Revenant', 'Entity'].map(value => ({ value, label: value }));
// Canon role suggestions: The Unwoven — Adversary System pp. 5–6, 15.
export const roleOptions = ['Brawler', 'Shooter', 'Disruptor', 'Support', 'Swarm', 'Hazardous', 'Lurker', 'Leader', 'Specialist'].map(value => ({ value, label: value }));
export const harmBands = { Light: [2, 4], Standard: [4, 6], Heavy: [7, 9], Brutal: [10, Infinity] } as const;

export function withExistingChoice(options: { value: string; label: string }[], value?: string, invalid = false) {
  return value && !options.some(option => option.value === value) ? [...options, { value, label: `Existing: ${value}${invalid ? ' — choose a valid tier' : ''}` }] : options;
}

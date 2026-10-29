import type { harmBands } from './Combatant.choices';

export type HarmBand = keyof typeof harmBands;
export type CombatantHarmProps = { value: string; onChange: (value: string) => void };

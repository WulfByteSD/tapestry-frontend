import type { EncounterCombatantSnapshot } from '@tapestry/types';

export type CombatantPreviewProps = { snapshot: EncounterCombatantSnapshot; active: boolean; onClose: () => void };
export type PreviewListProps = { title: string; values?: string[] };

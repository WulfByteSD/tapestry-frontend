import type { CharacterSheet } from '@tapestry/types';

export type ResourceModalProps = { sheet: CharacterSheet; onClose: () => void };
export type HpMode = 'heal' | 'set';
export type ThreadsMode = 'spend' | 'gain' | 'set';

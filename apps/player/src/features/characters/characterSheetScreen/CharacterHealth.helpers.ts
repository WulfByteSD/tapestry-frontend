import type { CharacterSheet } from '@tapestry/types';

export type CharacterHealthBaseline = { hp: CharacterSheet['sheet']['resources']['hp']; conditions: CharacterSheet['sheet']['conditions'] };

export function characterHealthBaseline(character: CharacterSheet): CharacterHealthBaseline {
  return structuredClone({ hp: character.sheet.resources.hp, conditions: character.sheet.conditions ?? [] });
}

export function changesCharacterHealth(updates: Record<string, unknown>) {
  return Object.entries(updates).some(([key, value]) => {
    if (key === 'sheet') return !!value && typeof value === 'object' && ('conditions' in value || ('resources' in value && !!value.resources && typeof value.resources === 'object' && 'hp' in value.resources));
    if (key === 'sheet.resources') return !!value && typeof value === 'object' && 'hp' in value;
    return key === 'sheet.resources.hp' || key.startsWith('sheet.resources.hp.') || key === 'sheet.conditions' || key.startsWith('sheet.conditions.');
  });
}

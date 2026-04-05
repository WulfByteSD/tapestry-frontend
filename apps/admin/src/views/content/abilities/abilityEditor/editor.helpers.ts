import type { AbilityDefinition } from '@tapestry/types';
import type { AbilityEditorFormValues } from './editor.types';

/**
 * Initialize ability form values from API response
 */
export function initializeAbilityForm(ability: AbilityDefinition): AbilityEditorFormValues {
  const { _id, createdAt, updatedAt, ...formValues } = ability;
  return formValues;
}

/**
 * Get default form values for a new ability
 */
export function getDefaultAbilityFormValues(): AbilityEditorFormValues {
  return {
    key: '',
    name: '',
    status: 'draft',
    settingKeys: [],
    category: 'spell',
    sourceType: 'learned',
    activation: 'action',
    usageModel: 'at-will',
    cost: null,
    defaultAspect: undefined,
    allowedSkillKeys: [],
    tags: [],
    summary: '',
    effectText: '',
  };
}

import type { SkillDefinition } from '@tapestry/types';
import type { SkillEditorFormValues } from './editor.types';

/**
 * Initialize skill form values from API response
 */
export function initializeSkillForm(skill: SkillDefinition): SkillEditorFormValues {
  const { _id, createdAt, updatedAt, ...formValues } = skill;
  return formValues;
}

/**
 * Get default form values for a new skill
 */
export function getDefaultSkillFormValues(): SkillEditorFormValues {
  return {
    key: '',
    name: '',
    status: 'draft',
    settingKeys: [],
    category: undefined,
    defaultAspect: undefined,
    tags: [],
    notes: '',
  };
}

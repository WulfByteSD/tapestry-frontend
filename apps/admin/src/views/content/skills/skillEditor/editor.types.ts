import type { SkillDefinition } from '@tapestry/types';

export type SkillEditorFormValues = Omit<SkillDefinition, '_id' | 'createdAt' | 'updatedAt'>;

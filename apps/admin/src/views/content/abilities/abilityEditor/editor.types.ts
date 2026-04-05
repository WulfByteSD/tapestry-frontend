import type { AbilityDefinition } from '@tapestry/types';

export type AbilityEditorFormValues = Omit<AbilityDefinition, '_id' | 'createdAt' | 'updatedAt'>;

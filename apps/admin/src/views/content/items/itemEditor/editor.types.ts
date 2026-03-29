import { AttackProfile, ItemDefinition } from '@tapestry/types';

export type ItemEditorFormValues = Omit<ItemDefinition, '_id' | 'createdAt' | 'updatedAt'>;

export type AttackProfileDraft = {
  key: string;
  name: string;
  attackKind: AttackProfile['attackKind'] | '';
  defaultAspect: string;
  allowedSkillKeys: string[];
  modifier?: number;
  harm?: number;
  rangeLabel: string;
  tags: string[];
  notes: string;
};

export type AttackProfileDraftErrors = Partial<Record<'key' | 'name' | 'modifier' | 'harm', string>>;

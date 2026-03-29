import { ASPECT_BLOCKS } from '@tapestry/types';
import type { SelectOption } from '@tapestry/ui';

export const SKILL_SETTING_OPTIONS: SelectOption[] = [
  { label: 'Woven Realms', value: 'woven-realms' },
  { label: 'Neon Lights', value: 'neon-lights' },
];

export const SKILL_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Social', value: 'social' },
  { label: 'Combat', value: 'combat' },
  { label: 'Technical', value: 'technical' },
  { label: 'Knowledge', value: 'knowledge' },
  { label: 'Survival', value: 'survival' },
  { label: 'Magic', value: 'magic' },
  { label: 'Other', value: 'other' },
];

export const SKILL_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export const SKILL_ASPECT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  ...ASPECT_BLOCKS.flatMap((block) =>
    block.keys.map((aspect) => ({
      label: `${aspect.label} (${block.title})`,
      value: `${block.group}.${aspect.key}`,
    }))
  ),
];

import { ASPECT_BLOCKS } from '@tapestry/types';
import type { SelectOption } from '@tapestry/ui';

export const ABILITY_SETTING_OPTIONS: SelectOption[] = [
  { label: 'Woven Realms', value: 'woven-realms' },
  { label: 'Neon Lights', value: 'neon-lights' },
];

export const ABILITY_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Spell', value: 'spell' },
  { label: 'Technique', value: 'technique' },
  { label: 'Augment', value: 'augment' },
  { label: 'Program', value: 'program' },
  { label: 'Prayer', value: 'prayer' },
  { label: 'Mutation', value: 'mutation' },
  { label: 'Feature', value: 'feature' },
  { label: 'Other', value: 'other' },
];

export const ABILITY_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export const ABILITY_SOURCE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Learned', value: 'learned' },
  { label: 'Item-Granted', value: 'item-granted' },
  { label: 'Implant-Granted', value: 'implant-granted' },
  { label: 'Feature-Granted', value: 'feature-granted' },
  { label: 'Innate', value: 'innate' },
];

export const ABILITY_ACTIVATION_OPTIONS: SelectOption[] = [
  { label: 'Action', value: 'action' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Reaction', value: 'reaction' },
  { label: 'Passive', value: 'passive' },
  { label: 'Downtime', value: 'downtime' },
  { label: 'Special', value: 'special' },
];

export const ABILITY_USAGE_MODEL_OPTIONS: SelectOption[] = [
  { label: 'At-Will', value: 'at-will' },
  { label: 'Resource Cost', value: 'resource-cost' },
  { label: 'Per Scene', value: 'per-scene' },
  { label: 'Per Rest', value: 'per-rest' },
  { label: 'Cooldown', value: 'cooldown' },
  { label: 'Charges', value: 'charges' },
];

export const ABILITY_ASPECT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  ...ASPECT_BLOCKS.flatMap((block) =>
    block.keys.map((aspect) => ({
      label: `${aspect.label} (${block.title})`,
      value: `${block.group}.${aspect.key}`,
    }))
  ),
];

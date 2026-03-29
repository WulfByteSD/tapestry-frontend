import { ASPECT_BLOCKS } from '@tapestry/types';
import { type SelectOption } from '@tapestry/ui';
import { AttackProfileDraft } from './editor.types';

export const ITEM_SETTING_OPTIONS: SelectOption[] = [
  { label: 'Woven Realms', value: 'woven-realms' },
  { label: 'Neon Lights', value: 'neon-lights' },
];

export const ITEM_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Weapon', value: 'weapon' },
  { label: 'Armor', value: 'armor' },
  { label: 'Gear', value: 'gear' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Tool', value: 'tool' },
  { label: 'Currency', value: 'currency' },
  { label: 'Quest', value: 'quest' },
  { label: 'Other', value: 'other' },
];

export const ITEM_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export const ITEM_SLOT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  { label: 'Head', value: 'head' },
  { label: 'Body', value: 'body' },
  { label: 'Legs', value: 'legs' },
  { label: 'Feet', value: 'feet' },
  { label: 'Hands', value: 'hands' },
  { label: 'Weapon', value: 'weapon' },
  { label: 'Shield', value: 'shield' },
  { label: 'Accessory', value: 'accessory' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Other', value: 'other' },
];

export const ATTACK_KIND_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  { label: 'Melee', value: 'melee' },
  { label: 'Ranged', value: 'ranged' },
  { label: 'Spell', value: 'spell' },
  { label: 'Special', value: 'special' },
];

export const ATTACK_PROFILE_ASPECT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  ...ASPECT_BLOCKS.flatMap((block) =>
    block.keys.map((aspect) => ({
      label: `${aspect.label} (${block.title})`,
      value: `${block.group}.${aspect.key}`,
    }))
  ),
];

export const EMPTY_ATTACK_PROFILE_DRAFT: AttackProfileDraft = {
  key: '',
  name: '',
  attackKind: '',
  defaultAspect: '',
  allowedSkillKeys: [],
  modifier: undefined,
  harm: undefined,
  rangeLabel: '',
  tags: [],
  notes: '',
};

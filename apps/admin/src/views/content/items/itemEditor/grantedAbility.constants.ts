import { type SelectOption } from '@tapestry/ui';
import { GrantedAbilityRef } from '@tapestry/types';

export const GRANT_MODE_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'Passive', value: 'passive' },
];

export const ABILITY_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'All Categories', value: '' },
  { label: 'Spell', value: 'spell' },
  { label: 'Technique', value: 'technique' },
  { label: 'Augment', value: 'augment' },
  { label: 'Program', value: 'program' },
  { label: 'Prayer', value: 'prayer' },
  { label: 'Mutation', value: 'mutation' },
  { label: 'Feature', value: 'feature' },
  { label: 'Other', value: 'other' },
];

export const ABILITY_SOURCE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'All Source Types', value: '' },
  { label: 'Item-Granted', value: 'item-granted' },
  { label: 'Implant-Granted', value: 'implant-granted' },
  { label: 'Feature-Granted', value: 'feature-granted' },
  { label: 'Innate', value: 'innate' },
];

export const EMPTY_GRANTED_ABILITY_DRAFT: Omit<GrantedAbilityRef, 'abilityKey'> & { abilityKey: string } = {
  abilityId: '',
  abilityKey: '',
  requiresEquipped: false,
  grantMode: 'active',
  notes: '',
};

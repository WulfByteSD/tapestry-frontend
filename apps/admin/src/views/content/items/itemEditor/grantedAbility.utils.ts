import { GrantedAbilityRef, AbilityDefinition } from '@tapestry/types';

export function formatGrantedAbilitySummary(ref: GrantedAbilityRef, ability?: AbilityDefinition | null): string {
  const parts: string[] = [];

  if (ref.grantMode) {
    parts.push(ref.grantMode === 'passive' ? 'Passive' : 'Active');
  }

  if (ref.requiresEquipped) {
    parts.push('Requires Equipped');
  } else {
    parts.push('Always Available');
  }

  return parts.join(' · ');
}

export function validateGrantedAbilityRef(abilityId: string, existingRefs: GrantedAbilityRef[], originalAbilityId: string | null): string | null {
  if (!abilityId) {
    return 'Ability is required.';
  }

  const duplicate = existingRefs.find((ref) => ref.abilityId === abilityId && ref.abilityId !== originalAbilityId);

  if (duplicate) {
    return 'This ability is already granted by this item.';
  }

  return null;
}

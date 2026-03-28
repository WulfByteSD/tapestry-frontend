import { useState } from 'react';
import { GrantedAbilityRef } from '@tapestry/types';
import { useAlert } from '@tapestry/ui';
import { useUpdateItem } from '@/lib/content-admin';
import { ItemEditorFormValues } from './editor.types';
import { EMPTY_GRANTED_ABILITY_DRAFT } from './grantedAbility.constants';
import { validateGrantedAbilityRef } from './grantedAbility.utils';

type GrantedAbilityDraft = Omit<GrantedAbilityRef, 'abilityKey'> & { abilityKey: string };

type UseGrantedAbilityEditorProps = {
  itemId?: string;
  formValues: ItemEditorFormValues;
  onAbilitiesChange: (abilities: GrantedAbilityRef[]) => void;
  replaceFormValues: (values: ItemEditorFormValues) => void;
};

export function useGrantedAbilityEditor({ itemId, formValues, onAbilitiesChange, replaceFormValues }: UseGrantedAbilityEditorProps) {
  const { addAlert } = useAlert();
  const updateItem = useUpdateItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<GrantedAbilityDraft>({ ...EMPTY_GRANTED_ABILITY_DRAFT });
  const [error, setError] = useState<string | null>(null);
  const [originalAbilityId, setOriginalAbilityId] = useState<string | null>(null);

  const grantedAbilities = formValues.grantedAbilities ?? [];

  const closeModal = () => {
    if (updateItem.isPending) return;

    setIsModalOpen(false);
    setOriginalAbilityId(null);
    setError(null);
    setDraft({ ...EMPTY_GRANTED_ABILITY_DRAFT });
  };

  const openCreateModal = () => {
    setOriginalAbilityId(null);
    setError(null);
    setDraft({ ...EMPTY_GRANTED_ABILITY_DRAFT });
    setIsModalOpen(true);
  };

  const openEditModal = (ref: GrantedAbilityRef) => {
    setOriginalAbilityId(ref.abilityId);
    setError(null);
    setDraft({
      abilityId: ref.abilityId,
      abilityKey: ref.abilityKey,
      requiresEquipped: ref.requiresEquipped ?? false,
      grantMode: ref.grantMode ?? 'active',
      notes: ref.notes ?? '',
    });
    setIsModalOpen(true);
  };

  const updateDraft = <K extends keyof GrantedAbilityDraft>(name: K, value: GrantedAbilityDraft[K]) => {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === 'abilityId' && error) {
      setError(null);
    }
  };

  const persistAbilities = async (nextAbilities: GrantedAbilityRef[], successMessage: string, successDescription: string, errorMessage: string, errorDescription: string) => {
    if (!itemId) return false;

    const previousAbilities = grantedAbilities;
    const nextValues: ItemEditorFormValues = {
      ...formValues,
      grantedAbilities: nextAbilities,
    };

    onAbilitiesChange(nextAbilities);

    try {
      await updateItem.mutateAsync(itemId, nextValues);
      replaceFormValues(nextValues);

      addAlert({
        type: 'success',
        message: successMessage,
        description: successDescription,
      });

      return true;
    } catch (error) {
      onAbilitiesChange(previousAbilities);

      addAlert({
        type: 'error',
        message: errorMessage,
        description: errorDescription,
      });

      return false;
    }
  };

  const handleSubmit = async () => {
    const validationError = validateGrantedAbilityRef(draft.abilityId, grantedAbilities, originalAbilityId);

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextRef: GrantedAbilityRef = {
      abilityId: draft.abilityId,
      abilityKey: draft.abilityKey,
      requiresEquipped: draft.requiresEquipped || undefined,
      grantMode: draft.grantMode || undefined,
      notes: draft.notes?.trim() || undefined,
    };

    const nextAbilities = originalAbilityId == null ? [...grantedAbilities, nextRef] : grantedAbilities.map((ref) => (ref.abilityId === originalAbilityId ? nextRef : ref));

    const success = await persistAbilities(
      nextAbilities,
      originalAbilityId == null ? 'Ability added' : 'Ability updated',
      `The ability was ${originalAbilityId == null ? 'added to' : 'updated on'} this item immediately.`,
      originalAbilityId == null ? 'Ability add failed' : 'Ability update failed',
      'The ability could not be persisted. Your local change was rolled back.'
    );

    if (success) {
      closeModal();
    }
  };

  const handleRemove = async () => {
    if (!originalAbilityId) return;

    const nextAbilities = grantedAbilities.filter((ref) => ref.abilityId !== originalAbilityId);

    const success = await persistAbilities(
      nextAbilities,
      'Ability removed',
      'The ability was removed from this item immediately.',
      'Ability remove failed',
      'The ability could not be removed. The saved item data is unchanged.'
    );

    if (success) {
      closeModal();
    }
  };

  return {
    // State
    isModalOpen,
    draft,
    error,
    originalAbilityId,
    isPending: updateItem.isPending,

    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    updateDraft,
    handleSubmit,
    handleRemove,
  };
}

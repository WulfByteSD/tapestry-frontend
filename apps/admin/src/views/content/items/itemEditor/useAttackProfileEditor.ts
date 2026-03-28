import { useState } from 'react';
import { AttackProfile } from '@tapestry/types';
import { useAlert } from '@tapestry/ui';
import { useUpdateItem } from '@/lib/content-admin';
import { AttackProfileDraft, AttackProfileDraftErrors, ItemEditorFormValues } from './editor.types';
import { EMPTY_ATTACK_PROFILE_DRAFT } from './editor.constants';
import { createAttackProfileDraft, normalizeAttackProfileDraft, validateAttackProfileDraft, slugifyAttackProfileKey } from './editor.utils';

type UseAttackProfileEditorProps = {
  itemId?: string;
  formValues: ItemEditorFormValues;
  onProfilesChange: (profiles: AttackProfile[]) => void;
  replaceFormValues: (values: ItemEditorFormValues) => void;
};

export function useAttackProfileEditor({ itemId, formValues, onProfilesChange, replaceFormValues }: UseAttackProfileEditorProps) {
  const { addAlert } = useAlert();
  const updateItem = useUpdateItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<AttackProfileDraft>({ ...EMPTY_ATTACK_PROFILE_DRAFT });
  const [errors, setErrors] = useState<AttackProfileDraftErrors>({});
  const [originalKey, setOriginalKey] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const attackProfiles = formValues.attackProfiles ?? [];

  const closeModal = () => {
    if (updateItem.isPending) return;

    setIsModalOpen(false);
    setOriginalKey(null);
    setHasCustomKey(false);
    setErrors({});
    setDraft({ ...EMPTY_ATTACK_PROFILE_DRAFT });
  };

  const openCreateModal = () => {
    setOriginalKey(null);
    setHasCustomKey(false);
    setErrors({});
    setDraft({ ...EMPTY_ATTACK_PROFILE_DRAFT });
    setIsModalOpen(true);
  };

  const openEditModal = (profile: AttackProfile) => {
    setOriginalKey(profile.key);
    setHasCustomKey(profile.key !== slugifyAttackProfileKey(profile.name));
    setErrors({});
    setDraft(createAttackProfileDraft(profile));
    setIsModalOpen(true);
  };

  const updateDraft = <K extends keyof AttackProfileDraft>(name: K, value: AttackProfileDraft[K]) => {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name as keyof AttackProfileDraftErrors]) return current;

      const nextErrors = { ...current };
      delete nextErrors[name as keyof AttackProfileDraftErrors];
      return nextErrors;
    });
  };

  const handleNameChange = (value: string) => {
    setDraft((current) => {
      const nextDraft = {
        ...current,
        name: value,
      };

      if (!hasCustomKey) {
        nextDraft.key = slugifyAttackProfileKey(value);
      }

      return nextDraft;
    });

    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.name;
      delete nextErrors.key;
      return nextErrors;
    });
  };

  const handleKeyChange = (value: string) => {
    setHasCustomKey(value !== slugifyAttackProfileKey(draft.name));
    updateDraft('key', value);
  };

  const persistProfiles = async (nextProfiles: AttackProfile[], successMessage: string, successDescription: string, errorMessage: string, errorDescription: string) => {
    if (!itemId) return false;

    const previousProfiles = attackProfiles;
    const nextValues: ItemEditorFormValues = {
      ...formValues,
      attackProfiles: nextProfiles,
    };

    onProfilesChange(nextProfiles);

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
      onProfilesChange(previousProfiles);

      addAlert({
        type: 'error',
        message: errorMessage,
        description: errorDescription,
      });

      return false;
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateAttackProfileDraft(draft, attackProfiles, originalKey);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nextProfile = normalizeAttackProfileDraft(draft);
    const nextProfiles = originalKey == null ? [...attackProfiles, nextProfile] : attackProfiles.map((profile) => (profile.key === originalKey ? nextProfile : profile));

    const success = await persistProfiles(
      nextProfiles,
      originalKey == null ? 'Attack profile added' : 'Attack profile saved',
      `${nextProfile.name} was saved to this item immediately.`,
      originalKey == null ? 'Attack profile add failed' : 'Attack profile save failed',
      'The attack profile could not be persisted. Your local change was rolled back.'
    );

    if (success) {
      closeModal();
    }
  };

  const handleRemove = async () => {
    if (!originalKey) return;

    const profileToRemove = attackProfiles.find((profile) => profile.key === originalKey);
    const nextProfiles = attackProfiles.filter((profile) => profile.key !== originalKey);

    const success = await persistProfiles(
      nextProfiles,
      'Attack profile removed',
      `${profileToRemove?.name ?? 'The attack profile'} was removed and synced immediately.`,
      'Attack profile remove failed',
      'The attack profile could not be removed. The saved item data is unchanged.'
    );

    if (success) {
      closeModal();
    }
  };

  return {
    // State
    isModalOpen,
    draft,
    errors,
    originalKey,
    isPending: updateItem.isPending,

    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    updateDraft,
    handleNameChange,
    handleKeyChange,
    handleSubmit,
    handleRemove,
  };
}

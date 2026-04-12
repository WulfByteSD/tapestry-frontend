'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { defaultDraft, type CharacterDraft } from './characterCreator.types';
import { type CreatorStepKey, getCreatorStep } from './characterCreator.config';
import { draftToCreatePayload, draftToUpdatePayload } from './characterCreator.mapper';

export type UseCharacterCreatorFormReturn = {
  step: CreatorStepKey;
  direction: 1 | -1;
  draft: CharacterDraft;
  setField: <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => void;
  setAspect: (group: string, key: string, value: number) => void;
  canAdvance: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  goNext: () => void;
  goPrev: () => void;
  handleSubmit: () => Promise<void>;
  handleQuickStart: () => Promise<void>;
};

function canAdvanceStep(step: CreatorStepKey, draft: CharacterDraft): boolean {
  if (step === 'identity') return draft.name.trim().length >= 1;
  return true;
}

export function useCharacterCreatorForm(): UseCharacterCreatorFormReturn {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<CreatorStepKey>('identity');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [draft, setDraft] = useState<CharacterDraft>(defaultDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setAspect(group: string, key: string, value: number) {
    setDraft((prev) => ({
      ...prev,
      aspects: {
        ...prev.aspects,
        [group]: {
          ...(prev.aspects as any)[group],
          [key]: value,
        },
      },
    }));
  }

  function goNext() {
    const next = getCreatorStep(step).next;
    if (next) {
      setDirection(1);
      setStep(next);
    }
  }

  function goPrev() {
    const back = getCreatorStep(step).back;
    if (back) {
      setDirection(-1);
      setStep(back);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: create the character record (only name required)
      const createRes = await api.post('/game/characters', draftToCreatePayload(draft));
      const characterId = createRes.data?.payload;

      if (!characterId) {
        throw new Error('Server did not return a character id.');
      }

      // Step 2: populate all other fields via PUT
      const updatePayload = draftToUpdatePayload(draft);
      if (Object.keys(updatePayload).length > 0) {
        await api.put(`/game/characters/${characterId}`, updatePayload);
      }

      // Invalidate the character list so it reflects the new character
      queryClient.invalidateQueries({ queryKey: ['characters'] });

      router.replace(`/characters/${characterId}?mode=build`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to create character. Please try again.';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  }

  async function handleQuickStart() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createRes = await api.post('/game/characters', { name: 'New Character' });
      const characterId = createRes.data?.payload;

      if (!characterId) {
        throw new Error('Server did not return a character id.');
      }

      queryClient.invalidateQueries({ queryKey: ['characters'] });
      router.replace(`/characters/${characterId}?mode=build`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to create character. Please try again.';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  }

  return {
    step,
    direction,
    draft,
    setField,
    setAspect,
    canAdvance: canAdvanceStep(step, draft),
    isSubmitting,
    submitError,
    goNext,
    goPrev,
    handleSubmit,
    handleQuickStart,
  };
}

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoll, getSkillsForSetting, type CreateRollData } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { getAspectValue } from '@/features/characters/aspects/aspectutils';
import { buildSkillOptions } from '@/features/characters/characterSheetScreen/tabs/skills/skillDisplay.helpers';
import { aspectOptions, signed } from './QuickRoll.helpers';
import { rollHistoryKey } from '../rollHistory/RollHistory.helpers';
import type { QuickRollDraftProps, RollCondition } from './QuickRoll.types';

export function useQuickRoll({ campaignId, playerId, character }: QuickRollDraftProps) {
  const client = useQueryClient();
  const submitting = useRef(false);
  const [aspect, setAspect] = useState(aspectOptions[0].value);
  const [skill, setSkill] = useState('');
  const [modifier, setModifier] = useState('0');
  const [diceCount, setDiceCount] = useState('3');
  const [context, setContext] = useState('');
  const [condition, setCondition] = useState<RollCondition>('normal');
  const skills = useQuery({
    queryKey: ['content:skills', character?.settingKey],
    queryFn: () => getSkillsForSetting(api, character!.settingKey!),
    enabled: !!character?.settingKey,
  });
  const skillOptions = buildSkillOptions(character?.sheet.skills ?? {}, skills.data?.payload ?? []);
  const selectedAspect = aspectOptions.find((entry) => entry.value === aspect)!;
  const aspectBonus = character ? getAspectValue(character, selectedAspect.group, selectedAspect.key) : 0;
  const selectedSkill = skillOptions.find((entry) => entry.id === skill);
  const skillBonus = selectedSkill?.rank ?? 0;
  const modifierValue = Number(modifier);
  const count = character || condition !== 'normal' ? 3 : Number(diceCount);
  const valid = modifier.trim() !== '' && Number.isSafeInteger(modifierValue) && Math.abs(modifierValue) <= 100
    && Number.isInteger(count) && count >= 1 && count <= 20;
  const bonus = aspectBonus + skillBonus + modifierValue;
  const diceLabel = condition === 'normal' ? `${count}d6` : `4d6, keep ${condition === 'edge' ? 'best' : 'worst'} 3`;
  const preview = `${diceLabel}${bonus ? ` ${signed(bonus)}` : ''}`;
  const defaultContext = character ? [selectedAspect.label, selectedSkill?.name].filter(Boolean).join(' + ') : 'Plain dice';
  const mutation = useMutation({
    retry: false,
    mutationFn: async (data: CreateRollData) => {
      const response = await createRoll(api, data);
      return { ...response.payload, breakdown: response.payload.breakdown ?? response.payload.expression, context: data.context };
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['campaign', campaignId, 'activity'] });
      void client.invalidateQueries({ queryKey: rollHistoryKey(campaignId, playerId) });
    },
    onSettled: () => { submitting.current = false; },
  });
  const roll = () => {
    if (!valid || submitting.current || mutation.isPending || mutation.data) return;
    submitting.current = true;
    mutation.mutate({
      campaignId, playerId, characterId: character?._id ?? null,
      diceCount: count, faces: 6, edge: condition === 'edge', burden: condition === 'burden',
      operations: bonus ? [{ operator: bonus >= 0 ? '+' : '-', value: Math.abs(bonus) }] : [],
      rollType: character ? 'approach' : 'custom',
      aspectUsed: character ? aspect : undefined,
      context: context.trim() || defaultContext,
    });
  };
  return { aspect, setAspect, skill, setSkill, modifier, setModifier, diceCount, setDiceCount, context, setContext,
    condition, setCondition, skillOptions, skills, aspectBonus, skillBonus, preview, valid, mutation, roll };
}

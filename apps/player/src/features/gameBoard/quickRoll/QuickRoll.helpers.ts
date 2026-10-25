import { ASPECT_BLOCKS, type CharacterSheet } from '@tapestry/types';
import { isAxiosError } from 'axios';

export const aspectOptions = ASPECT_BLOCKS.flatMap((block) => block.keys.map((key) => ({
  value: `${block.group}.${key.key}`, label: `${key.label} (${block.title})`, group: block.group, key: key.key,
})));

export function ownedRollCharacters(characters: CharacterSheet[], playerId: string, campaignId: string) {
  return characters.filter((character) => character.player === playerId && character.campaign === campaignId && character.status === 'active');
}

export function rollErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string; error?: string }>(error) && error.response) {
    return error.response.data.message || error.response.data.error || 'The roll could not be completed.';
  }
  return 'The result could not be confirmed. Check the Feed before rolling again: the first roll may already have been saved.';
}

export function signed(value: number) { return value >= 0 ? `+${value}` : String(value); }

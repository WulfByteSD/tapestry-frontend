import type { PlayerCharacterSheet } from './CharacterSheet.types';

export function titleCaseFromKey(value?: string | null) {
  return (value ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}

export function getSheetError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Your character could not be loaded. Please try again.';
}

export function getProtection(sheet: PlayerCharacterSheet) {
  // Match calculateCharacterProtection on the API: armor already contains this sum.
  return (sheet.sheet.inventory ?? []).reduce((total, item) =>
    total + (item.equipped && typeof item.protection === 'number' ? item.protection : 0), 0);
}

export function signedScore(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

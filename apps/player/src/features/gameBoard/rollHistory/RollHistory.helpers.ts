import { isAxiosError } from 'axios';

export const rollHistoryKey = (campaignId: string, playerId: string) => ['campaign-rolls', campaignId, playerId] as const;

export function rollAccessError(error: unknown): boolean {
  return isAxiosError(error) && [401, 403, 404].includes(error.response?.status ?? 0);
}

export function rollError(error: unknown): string {
  if (rollAccessError(error)) return 'This campaign’s rolls are no longer available to your account.';
  return 'The roll history could not be loaded. Please try again.';
}

export function rollLabel(value: string): string {
  return value.replace(/[_-]/g, ' ').split('.').map((part) => part.replace(/^\w/, (letter) => letter.toUpperCase())).join(' · ');
}

export function savedDice(allRolls: number[], keptRolls: number[]) {
  const remaining = [...keptRolls];
  return allRolls.map((value) => {
    const index = remaining.indexOf(value);
    if (index !== -1) remaining.splice(index, 1);
    return { value, kept: index !== -1 };
  });
}

export function rollTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

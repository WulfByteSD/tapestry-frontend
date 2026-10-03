import type { HpMode, ThreadsMode } from './ResourceModal.types';

export function clampResource(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
export function nonnegative(value: number) { return Math.max(0, Number(value) || 0); }
export function getHpPreview(current: number, maxDraft: number, tempDraft: number, mode: HpMode, amount: number) {
  const maximum = nonnegative(maxDraft);
  return { nextCurrent: maximum === 0 ? current : clampResource(mode === 'heal' ? current + nonnegative(amount) : nonnegative(amount), 0, maximum), nextTemp: nonnegative(tempDraft) };
}
export function getThreadsPreview(current: number, max: number, mode: ThreadsMode, amount: number) {
  const adjustment = nonnegative(amount);
  return clampResource(mode === 'spend' ? current - adjustment : mode === 'gain' ? current + adjustment : adjustment, 0, max);
}

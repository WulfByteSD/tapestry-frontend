import type { ChatComposition, ChatMessagePart } from '@tapestry/types';

export const emptyComposition: ChatComposition = { parts: [] };
export function compositionParts(composition: ChatComposition): ChatMessagePart[] {
  return composition.parts ?? [{ type: 'action', text: composition.action }, { type: 'dialogue', text: composition.dialogue }];
}
export function compositionContent(composition: ChatComposition): string {
  return compositionParts(composition).filter((part) => part.text.trim()).map((part) => {
    if (part.type === 'action') return part.text.trim();
    const spoken = part.text.trim().replace(/[\\`*_{}\[\]()#+.!|<>-]/g, '\\$&');
    return spoken.split(/\r?\n/).map((line) => `> ${line}`).join('\n');
  }).join('\n\n');
}

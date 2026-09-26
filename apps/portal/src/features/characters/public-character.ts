import type { CharacterSheet } from '@tapestry/types';

// Public responses deliberately omit ownership, campaign references, and journal cards.
// dtn already exists in the API; keep this extension local to the portal.
export type PublicCharacter = Pick<CharacterSheet, '_id' | 'name' | 'avatarUrl' | 'status' | 'settingKey' | 'toneModules' | 'tags' | 'updatedAt' | 'derived'> & {
  sheet: Omit<CharacterSheet['sheet'], 'noteCards'> & { dtn?: number };
};

export class CharacterLoadError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'CharacterLoadError';
  }
}

export async function fetchPublicCharacter(identifier: string, signal?: AbortSignal): Promise<PublicCharacter> {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/+$/, '');
  if (!origin) throw new CharacterLoadError(0, 'Character sheets are temporarily unavailable. Please try again later.');

  // Do not import the authenticated portal client or forward any saved session.
  const response = await fetch(`${origin}/api/v1/game/characters/${encodeURIComponent(identifier)}/public`, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    const message = response.status === 400
      ? 'This link is not valid. Ask the player for a link using their character ID.'
      : response.status === 404
        ? 'This character could not be found. It may have been removed or the link may be incorrect.'
        : response.status === 401 || response.status === 403
          ? 'This character is not available for public viewing.'
          : 'The character sheet could not be loaded. Please try again.';
    throw new CharacterLoadError(response.status, message);
  }

  const data = await response.json();
  if (data?.success !== true || !data.payload?._id || typeof data.payload.name !== 'string' || !data.payload.sheet) {
    throw new CharacterLoadError(502, 'The character sheet could not be loaded. Please try again.');
  }
  return data.payload;
}

export function displayKey(value: string): string {
  return (value.split(':').pop() ?? value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function score(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value) ? (value > 0 ? `+${value}` : String(value)) : '—';
}

'use server';

import { revalidatePath } from 'next/cache';
import { CharacterLoadError, fetchPublicCharacter, publicCharacterPath } from './public-character';

export async function refreshPublicCharacter(identifier: string): Promise<{ status: 'success' | 'error'; message: string }> {
  if (typeof identifier !== 'string' || !/^[a-f\d]{24}$/i.test(identifier)) {
    return { status: 'error', message: 'This character share link is not valid.' };
  }

  try {
    // Confirm the endpoint is available before replacing a previously saved view.
    await fetchPublicCharacter(identifier, undefined, { fresh: true });
  } catch (error) {
    if (error instanceof CharacterLoadError && [401, 403, 404].includes(error.status)) {
      revalidatePath(publicCharacterPath(identifier));
      return { status: 'error', message: 'This character is no longer available for public viewing.' };
    }
    return { status: 'error', message: 'Could not refresh the sheet. The displayed values have been kept; try again in a moment.' };
  }

  revalidatePath(publicCharacterPath(identifier));
  return { status: 'success', message: 'Sheet refreshed.' };
}

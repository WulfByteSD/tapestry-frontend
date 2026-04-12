import type { CharacterDraft } from './characterCreator.types';

/** Payload for POST /game/characters — only name is required by the server. */
export function draftToCreatePayload(draft: CharacterDraft): { name: string } {
  return { name: draft.name.trim() };
}

/**
 * Payload for PUT /game/characters/:id — dot-notation flat object.
 * Skips undefined/empty strings so we don't overwrite server defaults with blanks.
 */
export function draftToUpdatePayload(draft: CharacterDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (draft.archetypeKey.trim()) payload['sheet.archetypeKey'] = draft.archetypeKey.trim();
  if (draft.settingKey.trim()) payload['settingKey'] = draft.settingKey.trim();
  if (draft.avatarUrl.trim()) payload['avatarUrl'] = draft.avatarUrl.trim();

  // Always send aspects — they are set intentionally by the player.
  payload['sheet.aspects'] = draft.aspects;

  // Profile — only include fields the player actually filled in.
  const profile: Record<string, unknown> = {};
  if (draft.title.trim()) profile['title'] = draft.title.trim();
  if (draft.bio.trim()) profile['bio'] = draft.bio.trim();
  if (draft.race.trim()) profile['race'] = draft.race.trim();
  if (draft.nationality.trim()) profile['nationality'] = draft.nationality.trim();
  if (draft.sex.trim()) profile['sex'] = draft.sex.trim();
  if (draft.age.trim()) profile['age'] = draft.age.trim();
  if (draft.height.trim()) profile['height'] = draft.height.trim();
  if (draft.weight.trim()) profile['weight'] = draft.weight.trim();
  if (draft.eyes.trim()) profile['eyes'] = draft.eyes.trim();
  if (draft.hair.trim()) profile['hair'] = draft.hair.trim();
  if (draft.ethnicity.trim()) profile['ethnicity'] = draft.ethnicity.trim();
  if (draft.religion.trim()) profile['religion'] = draft.religion.trim();

  if (Object.keys(profile).length > 0) {
    payload['sheet.profile'] = profile;
  }

  return payload;
}

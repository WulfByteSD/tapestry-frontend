import type { CharacterSheet } from '@tapestry/types';
import type { CharacterDetailsDraft } from './CharacterDetails.types';

export function makeDetailsDraft(sheet: CharacterSheet): CharacterDetailsDraft {
  const profile = sheet.sheet.profile ?? {};

  return {
    avatarUrl: sheet.avatarUrl ?? '',
    settingKey: sheet.settingKey ?? '',
    archetypeKey: sheet.sheet.archetypeKey ?? '',
    weaveLevel: sheet.sheet.weaveLevel ?? 1,
    title: profile.title ?? '',
    bio: profile.bio ?? '',
    race: profile.race ?? '',
    nationality: profile.nationality ?? '',
    religion: profile.religion ?? '',
    sex: profile.sex ?? '',
    height: profile.height ?? '',
    weight: profile.weight ?? '',
    eyes: profile.eyes ?? '',
    hair: profile.hair ?? '',
    ethnicity: profile.ethnicity ?? '',
    age: profile.age != null ? String(profile.age) : '',
  };
}

export function makeDetailsUpdates(draft: CharacterDetailsDraft) {
    const normalizedWeaveLevel = Math.max(1, Number.isFinite(Number(draft.weaveLevel)) ? Number(draft.weaveLevel) : 1);

    return {
      avatarUrl: draft.avatarUrl.trim() || null,
      settingKey: draft.settingKey.trim() || null,
      'sheet.archetypeKey': draft.archetypeKey.trim() || null,
      'sheet.weaveLevel': normalizedWeaveLevel,
      'sheet.profile': {
        title: draft.title.trim() || undefined,
        bio: draft.bio.trim() || undefined,
        race: draft.race.trim() || undefined,
        nationality: draft.nationality.trim() || undefined,
        religion: draft.religion.trim() || undefined,
        sex: draft.sex.trim() || undefined,
        height: draft.height.trim() || undefined,
        weight: draft.weight.trim() || undefined,
        eyes: draft.eyes.trim() || undefined,
        hair: draft.hair.trim() || undefined,
        ethnicity: draft.ethnicity.trim() || undefined,
        age: draft.age.trim() || undefined,
      },
    };
  }
